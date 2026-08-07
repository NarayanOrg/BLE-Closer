import { BrowserWindow, screen } from 'electron';
import path from 'node:path';
import type { Rectangle } from 'electron';
import type { AppStore } from './store';

function clampBounds(bounds: Rectangle | null): Rectangle | null {
  if (!bounds) {
    return null;
  }
  const displays = screen.getAllDisplays();
  const fitsDisplay = displays.some((display) => {
    const area = display.workArea;
    return bounds.x < area.x + area.width && bounds.y < area.y + area.height;
  });
  return fitsDisplay ? bounds : null;
}

export function createMainWindow(store: AppStore): BrowserWindow {
  const savedBounds = clampBounds(store.get('windowBounds'));
  const window = new BrowserWindow({
    width: savedBounds?.width ?? 1200,
    height: savedBounds?.height ?? 780,
    x: savedBounds?.x,
    y: savedBounds?.y,
    minWidth: 1060,
    minHeight: 700,
    show: false,
    title: 'BLECloser',
    backgroundColor: '#f8fafc',
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  window.on('close', () => {
    store.set('windowBounds', window.getBounds());
  });

  return window;
}
