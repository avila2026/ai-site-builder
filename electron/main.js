const { app, BrowserWindow, dialog, shell } = require("electron");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const APP_FOLDER_NAME = "AI Site Builder";
const PROD_PORT = 39213;
const DEV_PORT = 3000;
const isDev = !app.isPackaged;
let activePort = isDev ? DEV_PORT : PROD_PORT;
let appBaseUrl = `http://127.0.0.1:${activePort}`;
let desktopDataDir = "";
let desktopUploadsDir = "";
let logFile = path.join(process.env.TEMP || process.cwd(), "ai-site-builder-electron.log");
let desktopEnvVars = {};
let mainWindow = null;
let authWindow = null;
let nextProcess = null;

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
  process.exit(0);
}

function serializeError(error) {
  if (!error) return "";
  if (error instanceof Error) return error.stack || error.message;
  return String(error);
}

function writeLog(message, details) {
  const suffix =
    details === undefined
      ? ""
      : ` ${typeof details === "string" ? details : JSON.stringify(details)}`;
  const line = `[${new Date().toISOString()}] ${message}${suffix}\n`;
  fs.appendFile(logFile, line, () => undefined);
}

function ensureDirSync(dirPath) {
  if (!dirPath) return;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function parseDotEnv(raw) {
  const parsed = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t");

    parsed[key] = value;
  }

  return parsed;
}

function loadDesktopEnvFile() {
  if (isDev || !desktopDataDir) {
    return {};
  }

  const envPath = path.join(desktopDataDir, ".env");
  if (!fs.existsSync(envPath)) {
    writeLog("desktop-env-missing", envPath);
    return {};
  }

  try {
    const envVars = parseDotEnv(fs.readFileSync(envPath, "utf8"));
    Object.entries(envVars).forEach(([key, value]) => {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
    writeLog("desktop-env-loaded", { envPath, keys: Object.keys(envVars).length });
    return envVars;
  } catch (error) {
    writeLog("desktop-env-load-error", serializeError(error));
    return {};
  }
}

function initializePaths() {
  const appDataRoot = app.getPath("appData");
  desktopDataDir = path.join(appDataRoot, APP_FOLDER_NAME);
  desktopUploadsDir = path.join(desktopDataDir, "uploads");
  const desktopLogsDir = path.join(desktopDataDir, "logs");
  ensureDirSync(desktopDataDir);
  ensureDirSync(desktopUploadsDir);
  ensureDirSync(desktopLogsDir);
  logFile = path.join(desktopLogsDir, "electron-main.log");
}

function getNextServerPath() {
  const candidates = isDev
    ? [
        path.join(__dirname, "..", ".next", "standalone"),
        path.join(process.cwd(), ".next", "standalone"),
      ]
    : [
        path.join(process.resourcesPath, ".next", "standalone"),
        path.join(process.resourcesPath, "app.asar.unpacked", ".next", "standalone"),
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
        path.join(__dirname, "build-resources", "icon.ico"),
        path.join(__dirname, "build-resources", "icon.png"),
        path.join(__dirname, "..", "public", "icon-512.png"),
      ]
    : [
        path.join(process.resourcesPath, "icon.ico"),
        path.join(process.resourcesPath, "app.asar.unpacked", "icon.ico"),
      ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isServerResponding() {
  return new Promise((resolve) => {
    const request = http.get(
      { host: "127.0.0.1", port: activePort, path: "/", timeout: 3000 },
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

function canBindPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

async function waitForServerReady(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isServerResponding()) {
      return;
    }

    if (nextProcess && nextProcess.exitCode !== null && nextProcess.exitCode !== 0) {
      throw new Error(`Servidor Next.js encerrou com código ${nextProcess.exitCode}`);
    }

    await delay(400);
  }
  throw new Error(`Servidor Next.js não respondeu em ${timeoutMs}ms`);
}

async function startNextServer() {
  if (isDev && (await isServerResponding())) {
    writeLog("next-server-dev-found", `http://127.0.0.1:${activePort}`);
    return;
  }

  const serverPath = getNextServerPath();
  if (!serverPath) {
    throw new Error("Build standalone do Next.js não encontrado dentro do pacote.");
  }

  const serverJs = path.join(serverPath, "server.js");
  if (!fs.existsSync(serverJs)) {
    throw new Error(`server.js não encontrado em: ${serverJs}`);
  }

  writeLog("next-server-starting", { serverPath, serverJs, activePort });
  nextProcess = spawn(process.execPath, [serverJs], {
    cwd: serverPath,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      ...desktopEnvVars,
      ELECTRON_RUN_AS_NODE: "1",
      ELECTRON_DESKTOP: "1",
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: String(activePort),
      APP_BASE_URL: appBaseUrl,
      APP_UPLOADS_DIR: desktopUploadsDir,
    },
  });

  nextProcess.stdout.on("data", (data) => {
    writeLog("next-server-stdout", data.toString().trim());
  });

  nextProcess.stderr.on("data", (data) => {
    writeLog("next-server-stderr", data.toString().trim());
  });

  nextProcess.on("error", (error) => {
    writeLog("next-server-process-error", serializeError(error));
  });

  nextProcess.on("exit", (code) => {
    writeLog("next-server-process-exit", { code });
  });

  await waitForServerReady();
}

function isLocalUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    return parsed.origin === appBaseUrl;
  } catch {
    return false;
  }
}

function isAuthEntryUrl(targetUrl) {
  if (!isLocalUrl(targetUrl)) return false;
  const parsed = new URL(targetUrl);
  return parsed.pathname === "/auth/login" || parsed.pathname === "/auth/logout";
}

function isAuthCallbackUrl(targetUrl) {
  if (!isLocalUrl(targetUrl)) return false;
  const parsed = new URL(targetUrl);
  return parsed.pathname === "/auth/callback";
}

function isAllowedAuthUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.origin === appBaseUrl) {
      return true;
    }

    const auth0Domain = normalizeAuth0Domain(
      process.env.AUTH0_DOMAIN || desktopEnvVars.AUTH0_DOMAIN,
    );
    if (!auth0Domain) {
      return false;
    }
    return parsed.hostname === auth0Domain || parsed.hostname.endsWith(`.${auth0Domain}`);
  } catch {
    return false;
  }
}

function normalizeAuth0Domain(rawValue) {
  if (!rawValue) return "";
  const trimmed = rawValue.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("://")) {
      return new URL(trimmed).hostname;
    }
  } catch {
    return "";
  }

  return trimmed.split("/")[0];
}

function closeAuthWindowAndRefresh() {
  if (authWindow && !authWindow.isDestroyed()) {
    authWindow.close();
  }
  authWindow = null;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.reloadIgnoringCache();
    mainWindow.focus();
  }
}

function openAuthWindow(entryUrl) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (authWindow && !authWindow.isDestroyed()) {
    authWindow.focus();
    authWindow.loadURL(entryUrl).catch((error) => {
      writeLog("auth-window-reload-error", serializeError(error));
    });
    return;
  }

  authWindow = new BrowserWindow({
    title: "Autenticação",
    width: 960,
    height: 760,
    parent: mainWindow,
    modal: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  authWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedAuthUrl(url)) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  authWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    if (!isAllowedAuthUrl(navigationUrl)) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
      return;
    }
    if (isAuthCallbackUrl(navigationUrl)) {
      setTimeout(closeAuthWindowAndRefresh, 400);
    }
  });

  authWindow.webContents.on("did-navigate", (_event, navigationUrl) => {
    if (isAuthCallbackUrl(navigationUrl)) {
      setTimeout(closeAuthWindowAndRefresh, 400);
    }
  });

  authWindow.once("ready-to-show", () => authWindow && authWindow.show());
  authWindow.on("closed", () => {
    authWindow = null;
  });

  authWindow.loadURL(entryUrl).catch((error) => {
    writeLog("auth-window-load-error", serializeError(error));
  });
}

function attachMainWindowSecurity(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isLocalUrl(url)) {
      if (isAuthEntryUrl(url)) {
        openAuthWindow(url);
        return { action: "deny" };
      }
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, navigationUrl) => {
    if (isLocalUrl(navigationUrl)) {
      if (isAuthEntryUrl(navigationUrl)) {
        event.preventDefault();
        openAuthWindow(navigationUrl);
      }
      return;
    }
    event.preventDefault();
  });
}

function createMainWindow() {
  const iconPath = getWindowIconPath();
  const windowOptions = {
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
    },
  };
  if (iconPath) {
    windowOptions.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowOptions);
  attachMainWindowSecurity(mainWindow);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    writeLog("window-did-fail-load", { errorCode, errorDescription, validatedURL });
  });

  mainWindow.loadURL(appBaseUrl).catch((error) => {
    writeLog("window-load-error", serializeError(error));
  });
}

app.on("second-instance", () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();
});

process.on("uncaughtException", (error) => {
  writeLog("uncaughtException", serializeError(error));
});

process.on("unhandledRejection", (reason) => {
  writeLog("unhandledRejection", serializeError(reason));
});

app.whenReady().then(async () => {
  initializePaths();
  desktopEnvVars = loadDesktopEnvFile();
  process.env.ELECTRON_DESKTOP = "1";
  process.env.APP_UPLOADS_DIR = desktopUploadsDir;
  if (isDev) {
    process.env.APP_BASE_URL = process.env.APP_BASE_URL || appBaseUrl;
    appBaseUrl = process.env.APP_BASE_URL;
  } else {
    appBaseUrl = `http://127.0.0.1:${PROD_PORT}`;
    process.env.APP_BASE_URL = appBaseUrl;
  }

  writeLog("app-when-ready", {
    isDev,
    activePort,
    appBaseUrl,
    desktopDataDir,
    desktopUploadsDir,
  });

  try {
    if (!isDev) {
      const canBind = await canBindPort(activePort);
      if (!canBind) {
        throw new Error(
          `A porta fixa ${activePort} está em uso. Feche outra instância do app ou o processo que está usando a porta.`,
        );
      }
    }

    await startNextServer();
    createMainWindow();
  } catch (error) {
    const message = serializeError(error);
    writeLog("app-startup-error", message);
    dialog.showErrorBox("Falha ao iniciar o AI Site Builder", message);
    app.quit();
    return;
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

function stopNextProcess() {
  if (!nextProcess) return;
  if (nextProcess.exitCode === null) {
    nextProcess.kill();
  }
  nextProcess = null;
}

app.on("before-quit", () => {
  writeLog("before-quit");
  stopNextProcess();
});

app.on("window-all-closed", () => {
  writeLog("window-all-closed");
  stopNextProcess();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
