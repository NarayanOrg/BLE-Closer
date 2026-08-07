import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import electronBinary from 'electron';

const root = process.cwd();
const electronOut = path.join(root, 'out-electron', 'electron', 'main', 'index.js');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: command.endsWith('.cmd'),
    ...options,
  });
  child.on('error', (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
  return child;
}

const startElectron = async () => {
  run(npmCommand, ['run', 'build:electron']);
  run(npmCommand, ['run', 'dev:renderer']);
  while (!fs.existsSync(electronOut)) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  run(electronBinary, [electronOut], {
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
    },
  });
};

void startElectron();