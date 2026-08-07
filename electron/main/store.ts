import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { StoredState } from '../../shared/types';

const defaultSettings: StoredState['settings'] = {
  autoScanOnStartup: true,
  scanIntervalMs: 1000,
  notificationsEnabled: true,
  audioEnabled: true,
  audioVolume: 0.65,
  audioPitch: 1,
  audioSensitivity: 0.7,
  rememberLastTrackedDevice: true,
  launchAtStartup: false,
  theme: 'light',
};

const defaults: StoredState = {
  settings: defaultSettings,
  favorites: {},
  history: [],
  windowBounds: null,
  lastTrackedDeviceId: null,
};

function getStorePath(): string {
  return path.join(app.getPath('userData'), 'blecloser-state.json');
}

function readState(): StoredState {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf8');
    return { ...defaults, ...(JSON.parse(raw) as Partial<StoredState>) };
  } catch {
    return defaults;
  }
}

function writeState(state: StoredState): void {
  fs.mkdirSync(path.dirname(getStorePath()), { recursive: true });
  fs.writeFileSync(getStorePath(), JSON.stringify(state, null, 2), 'utf8');
}

export class AppStore {
  private state: StoredState = readState();

  get<K extends keyof StoredState>(key: K): StoredState[K] {
    return this.state[key];
  }

  set<K extends keyof StoredState>(key: K, value: StoredState[K]): void {
    this.state = { ...this.state, [key]: value };
    writeState(this.state);
  }

  delete<K extends keyof StoredState>(key: K): void {
    this.state = { ...this.state, [key]: defaults[key] };
    writeState(this.state);
  }
}

export const appStore = new AppStore();
