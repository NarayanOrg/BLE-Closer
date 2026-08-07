import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { appStore } from './store';
import { BluetoothScannerService } from './bluetooth';
import { createMainWindow } from './window';
import { registerIpcHandlers } from './ipc';

const bluetooth = new BluetoothScannerService();
let mainWindow: BrowserWindow | null = null;

function getRendererUrl(): string {
  if (process.env.VITE_DEV_SERVER_URL) {
    return process.env.VITE_DEV_SERVER_URL;
  }

  const appRoot = path.resolve(app.getAppPath(), '../../..');
  return pathToFileURL(path.join(appRoot, 'dist', 'renderer', 'index.html')).toString();
}

async function createAppWindow(): Promise<void> {
  mainWindow = createMainWindow(appStore);
  registerIpcHandlers(mainWindow, appStore, bluetooth);

  const url = getRendererUrl();
  await mainWindow.loadURL(url);
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    void require('electron').shell.openExternal(targetUrl);
    return { action: 'deny' };
  });
}

app.setAppUserModelId('com.blecloser.app');

app.whenReady().then(async () => {
  await createAppWindow();
  if (appStore.get('settings').autoScanOnStartup) {
    void bluetooth.start();
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createAppWindow();
    }
  });
});

app.on('before-quit', () => {
  bluetooth.destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
