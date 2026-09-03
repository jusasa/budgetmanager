import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('===========================================================');
console.log('🛠️  Starting FinWise DEBUG & SIMULATION Environment...');
console.log('🔒 Security: Restricted exclusively to 127.0.0.1 (Localhost)');
console.log('===========================================================');

// 1. Run Debug Express Server (Port 4001, strictly on 127.0.0.1)
const debugServerProcess = spawn('node', ['server/debug-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// 2. Run Debug Vite Client (Port 5174, strictly on 127.0.0.1)
const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';
const debugClientProcess = spawn(npxCmd, ['vite', '--config', 'vite.debug.config.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n[DebugRunner] Shutting down debug processes...');
  try { debugServerProcess.kill(); } catch (e) {}
  try { debugClientProcess.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
