const { app, BrowserWindow, shell } = require("electron");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

// Mantém referência global da janela para evitar garbage collection
let mainWindow;
let nextProcess = null;

const isDev = process.env.NODE_ENV === "development";
const PORT = 3000;
let activePort = PORT;

const logFile = path.join(
  process.env.TEMP || process.cwd(),
  "ai-site-builder-electron.log",
);

async function findAvailablePort(startPort) {
  let port = startPort;
  while (true) {
    try {
      await new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(port, "127.0.0.1", () => {
          server.close(() => resolve());
        });
        server.on("error", reject);
      });
      return port;
    } catch (e) {
      port++;
      if (port > startPort + 100) throw new Error("Nenhuma porta disponível encontrada.");
    }
  }
}

function writeLog(message, details) {
  const suffix =
    details === undefined
      ? ""
      : ` ${typeof details === "string" ? details : JSON.stringify(details)}`;
  const line = `[${new Date().toISOString()}] ${message}${suffix}\n`;

  fs.appendFile(logFile, line, (err) => {
    if (err) console.error("Falha ao gravar log:", err);
  });
}

function serializeError(error) {
  if (!error) {
    return "";
  }

  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return String(error);
}

writeLog("electron-main-loaded", {
  isDev,
  processType: process.type,
  execPath: process.execPath,
});

process.on("uncaughtException", (error) => {
  writeLog("uncaughtException", serializeError(error));
});

process.on("unhandledRejection", (reason) => {
  writeLog("unhandledRejection", serializeError(reason));
});

function getNextServerPath() {
  const candidates = isDev
    ? [
        path.join(__dirname, "..", ".next", "standalone"),
        path.join(process.cwd(), ".next", "standalone"),
      ]
    : [
        path.join(process.resourcesPath, ".next", "standalone"),
        path.join(
          process.resourcesPath,
          "app.asar.unpacked",
          ".next",
          "standalone",
        ),
        path.join(app.getAppPath(), ".next", "standalone"),
      ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "server.js"))) {
      writeLog("next-server-path-found", candidate);
      return candidate;
    }
  }

  writeLog("next-server-path-missing", candidates);
  return null;
}

function getWindowIconPath() {
  const candidates = isDev
    ? [
        path.join(__dirname, "..", "build", "icon.ico"),
        path.join(__dirname, "..", "build", "icon.png"),
        path.join(__dirname, "..", "public", "icon-512.png"),
      ]
    : [
        path.join(process.resourcesPath, "icon.ico"),
        path.join(
          process.resourcesPath,
          "app.asar.unpacked",
          "build",
          "icon.ico",
        ),
      ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function probeServer() {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: "127.0.0.1",
        port: activePort,
        path: "/api/health",
        timeout: 2000,
      },
      (response) => {
        response.resume();
        resolve(response.statusCode >= 200 && response.statusCode < 500);
      },
    );

    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function waitForServerReady(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await probeServer()) {
      return;
    }

    if (
      nextProcess &&
      nextProcess.exitCode !== null &&
      nextProcess.exitCode !== 0
    ) {
      throw new Error(
        `Servidor Next.js encerrou com código ${nextProcess.exitCode}`,
      );
    }

    await delay(500);
  }

  throw new Error(`Servidor Next.js não respondeu em ${timeoutMs}ms`);
}

async function startNextServer() {
  if (isDev) {
    writeLog("next-server-dev-check", "Checking if dev server is already running");
    if (await probeServer()) {
      writeLog("next-server-dev-found", "Dev server is already running, skipping bootstrap");
      return;
    }
  }

  return new Promise((resolve, reject) => {
    const serverPath = getNextServerPath();
    if (!serverPath) {
      writeLog("next-server-bootstrap-failed", "standalone-build-missing");
      reject(
        new Error(
          "Build standalone do Next.js não encontrado dentro do pacote.",
        ),
      );
      return;
    }

    const serverJs = path.join(serverPath, "server.js");
    if (!fs.existsSync(serverJs)) {
      writeLog(
        "next-server-bootstrap-failed",
        `server.js nao encontrado em ${serverJs}`,
      );
      reject(new Error(`server.js não encontrado em: ${serverJs}`));
      return;
    }

    console.log("Iniciando servidor Next.js em:", serverPath);
    writeLog("next-server-starting", { serverPath, serverJs });

    let settled = false;
    const finishResolve = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        resolve();
      }
    };
    const finishReject = (error) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        reject(error);
      }
    };

    nextProcess = spawn(process.execPath, [serverJs], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        PORT: activePort.toString(),
        NODE_ENV: "production",
      },
      cwd: serverPath,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    nextProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`[Next.js] ${output}`);
      writeLog("next-server-stdout", output.trim());
    });

    nextProcess.stderr.on("data", (data) => {
      console.error(`[Next.js Error] ${data}`);
      writeLog("next-server-stderr", data.toString().trim());
    });

    nextProcess.on("error", (err) => {
      writeLog("next-server-process-error", serializeError(err));
      finishReject(err);
    });

    nextProcess.on("exit", (code) => {
      console.log(`Servidor Next.js encerrou: ${code}`);
      writeLog("next-server-process-exit", { code });

      if (!settled && code !== 0) {
        finishReject(new Error(`Servidor Next.js encerrou com código ${code}`));
      }
    });

    const timeoutId = setTimeout(() => {
      finishReject(
        new Error("Timeout aguardando o bootstrap do servidor Next.js."),
      );
    }, 35000);

    waitForServerReady()
      .then(() => {
        writeLog("next-server-ready");
        finishResolve();
      })
      .catch((error) => {
        writeLog("next-server-ready-failed", serializeError(error));
        finishReject(error);
      });
  });
}

function createWindow() {
  writeLog("create-window-called");
  const windowOptions = {
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    backgroundColor: "#0a0a0a",
  };
  const iconPath = getWindowIconPath();

  if (iconPath) {
    windowOptions.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowOptions);
  writeLog("window-created", { iconPath: iconPath || null });

  // Carrega o app
  const url = `http://localhost:${activePort}`;
  mainWindow.loadURL(url).catch((error) => {
    console.error("Erro ao carregar a janela principal:", error);
    writeLog("window-load-error", serializeError(error));
  });

  // Mostra a janela quando o servidor estiver pronto
  mainWindow.once("ready-to-show", () => {
    writeLog("window-ready-to-show");
    mainWindow.show();
    mainWindow.focus();
  });

  // Abre DevTools em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Abre links externos no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://localhost") || url.startsWith("file://")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    writeLog("window-closed");
    mainWindow = null;
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `Falha ao carregar ${validatedURL}: [${errorCode}] ${errorDescription}`,
      );
      writeLog("window-did-fail-load", {
        errorCode,
        errorDescription,
        validatedURL,
      });
    },
  );
}

// Aguarda o app estar pronto
app.whenReady().then(async () => {
  writeLog("app-when-ready");
  try {
    console.log("Buscando porta disponível...");
    activePort = await findAvailablePort(PORT);
    console.log(`Porta selecionada: ${activePort}`);

    console.log("Iniciando servidor Next.js...");
    await startNextServer();

    createWindow();
  } catch (error) {
    console.error("Erro ao iniciar:", error);
    writeLog("app-startup-error", serializeError(error));
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Limpeza ao fechar
app.on("window-all-closed", () => {
  writeLog("window-all-closed");
  if (nextProcess) {
    nextProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  writeLog("before-quit");
  if (nextProcess) {
    nextProcess.kill();
  }
});

// Perite navegação segura
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Permite navegação local
    if (parsedUrl.origin === `http://localhost:${activePort}`) {
      return;
    }

    // Bloqueia navegações externas
    event.preventDefault();
  });
});
