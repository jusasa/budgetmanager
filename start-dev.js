import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[DevRunner] Starting FinWise MVP Server and Client...');

// Run Express Server
const serverProcess = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// Run Vite Dev Server
const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';
const clientProcess = spawn(npxCmd, ['vite'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n[DevRunner] Shutting down processes...');
  try { serverProcess.kill(); } catch (e) {}
  try { clientProcess.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
