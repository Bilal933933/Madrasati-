const { spawn } = require('child_process');
const path = require('path');
const dir = path.join(__dirname);
const child = spawn(process.execPath, [path.join(dir, 'dist', 'main')], { cwd: dir, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
child.on('error', (err) => { console.error('launcher failed:', err.message); process.exit(1); });
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
