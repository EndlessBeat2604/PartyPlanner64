// PP64 Electron bootstrap

const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

require("electron-debug")({ enabled: true, showDevTools: false });

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 864
  });
  win.setMenu(null);
  win.maximize();

  win.loadURL(`file://${__dirname}/../index.html`);

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on('browser-window-created', (e, window) => {
  window.setMenu(null);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    app.quit();
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("update-check-start", (event, arg) => {
  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates();
});

ipcMain.on("update-check-doupdate", (event, arg) => {
  autoUpdater.downloadUpdate();
});

autoUpdater.on('checking-for-update', () => {
  if (!win) return;
  win.webContents.send("update-check-checking");
})
autoUpdater.on('update-available', (info) => {
  if (!win) return;
  win.webContents.send("update-check-hasupdate");
})
autoUpdater.on('update-not-available', (info) => {
  if (!win) return;
  win.webContents.send("update-check-noupdate");
})
autoUpdater.on('error', (err) => {
})
autoUpdater.on('download-progress', (progressObj) => {
})
autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.quitAndInstall();
})