const path = require("path");
const isDev = require("electron-is-dev");
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require("electron-devtools-installer");
const { app, BrowserWindow } = require("electron");

const icon = path.join(__dirname, "icons/icon_128@2x.png");
const buildIndex = path.join(__dirname, "../build/index.html");
const devUrl = "http://localhost:3000";
const prodUrl = `file://${buildIndex}`;
const isDarwin = process.platform === "darwin";

if (isDev) process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let mainWindow;

app.on("ready", createWindow);
app.on("window-all-closed", () => (!isDarwin ? app.quit() : null));
app.on("activate", () => (mainWindow ? createWindow() : null));

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    icon,
    webPreferences: {
      nodeIntegration: true
    }
  });
  await installExtension(REACT_DEVELOPER_TOOLS);
  mainWindow.loadURL(isDev ? devUrl : prodUrl);
  if (isDev) mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => (mainWindow = null));
}
