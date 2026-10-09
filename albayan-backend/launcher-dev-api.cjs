const { spawn } = require('child_process');
const path = require('path');
const dir = path.join(__dirname);
const php = 'C:\\Users\\blals\\.config\\herd\\bin\\php84\\php.exe';
const child = spawn(php, ['artisan', 'serve', '--host=127.0.0.1', '--port=8001'], { cwd: dir, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
child.on('error', (err) => { console.error('launcher failed:', err.message); process.exit(1); });
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
