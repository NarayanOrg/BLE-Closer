import { ipcMain, Notification, shell } from 'electron';
import type { BrowserWindow } from 'electron';
import type { AppStore } from './store';
import type { BluetoothScannerService } from './bluetooth';
import type { AppSnapshot, BluetoothEvent, StoreValueMap } from '../../shared/types';

type RendererEvent = BluetoothEvent;

export function registerIpcHandlers(window: BrowserWindow, store: AppStore, bluetooth: BluetoothScannerService): void {
  const sendEvent = (event: RendererEvent): void => {
    window.webContents.send('ble:event', event);
  };

  bluetooth.on('adapter-state', (state) => {
    sendEvent({ type: 'adapter-state', payload: { state } });
  });
  bluetooth.on('scan-state', (payload) => {
    sendEvent({ type: 'scan-state', payload });
  });
  bluetooth.on('device-updated', (payload) => {
    sendEvent({ type: 'device-updated', payload });
  });
  bluetooth.on('device-missing', (payload) => {
    sendEvent({ type: 'device-missing', payload });
  });
  bluetooth.on('error', (message: string) => {
    sendEvent({ type: 'error', payload: { message } });
  });

  ipcMain.handle('app:get-bootstrap', () => {
    const snapshot: AppSnapshot = {
      appVersion: process.env.npm_package_version ?? '1.0.0',
      store: {
        settings: store.get('settings'),
        favorites: store.get('favorites'),
        history: store.get('history'),
        windowBounds: store.get('windowBounds'),
        lastTrackedDeviceId: store.get('lastTrackedDeviceId'),
      },
      bluetooth: bluetooth.getSnapshot(),
    };
    return snapshot;
  });

  ipcMain.handle('bluetooth:start-scan', async () => bluetooth.start());
  ipcMain.handle('bluetooth:stop-scan', async () => bluetooth.stop());

  ipcMain.handle('store:get', <K extends keyof StoreValueMap>(_event: Electron.IpcMainInvokeEvent, key: K) => {
    return store.get(key);
  });

  ipcMain.handle(
    'store:set',
    <K extends keyof StoreValueMap>(_event: Electron.IpcMainInvokeEvent, key: K, value: StoreValueMap[K]) => {
      store.set(key, value);
      return true;
    },
  );

  ipcMain.handle('store:delete', <K extends keyof StoreValueMap>(_event: Electron.IpcMainInvokeEvent, key: K) => {
    store.delete(key);
    return true;
  });

  ipcMain.handle('shell:open-external', async (_event, url: string) => shell.openExternal(url));

  ipcMain.on('notification:show', (_event, title: string, body: string) => {
    if (!Notification.isSupported()) {
      return;
    }
    new Notification({ title, body }).show();
  });

  ipcMain.handle('window:save-bounds', (_event, bounds: Electron.Rectangle) => {
    store.set('windowBounds', bounds);
    return true;
  });
}
