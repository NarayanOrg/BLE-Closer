import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const cacheRoot = path.join(root, '.cache');
const electronCache = path.join(cacheRoot, 'electron');
const builderCache = path.join(cacheRoot, 'electron-builder');

mkdirSync(electronCache, { recursive: true });
mkdirSync(builderCache, { recursive: true });

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ELECTRON_CACHE: electronCache,
      ELECTRON_BUILDER_CACHE: builderCache,
      ...extraEnv,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npm', ['run', 'build:renderer']);
run('npm', ['run', 'build:electron']);
run('npx', ['electron-builder']);
