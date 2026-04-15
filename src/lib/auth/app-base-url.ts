const DEFAULT_WEB_APP_BASE_URL = "http://localhost:3000";
const DEFAULT_DESKTOP_APP_BASE_URL = "http://127.0.0.1:39213";

export function isElectronDesktopRuntime() {
  return process.env.ELECTRON_DESKTOP === "1";
}

export function getAppBaseUrl() {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) {
    return configured;
  }

  if (isElectronDesktopRuntime()) {
    return DEFAULT_DESKTOP_APP_BASE_URL;
  }

  return DEFAULT_WEB_APP_BASE_URL;
}
