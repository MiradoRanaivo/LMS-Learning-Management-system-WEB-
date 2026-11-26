import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const root = process.cwd();
const phpPort = Number(process.env.PHP_PORT || 8000);
const vitePort = Number(process.env.VITE_PORT || 3000);
const isWindows = process.platform === 'win32';

const configuredPhp = process.env.PHP_BIN;
const phpCandidates = configuredPhp
  ? [configuredPhp]
  : isWindows
    ? ['C:\\xampp\\php\\php.exe', 'C:\\Program Files\\xampp\\php\\php.exe', 'php']
    : ['php'];

const phpBin = phpCandidates.find((candidate) =>
  path.isAbsolute(candidate) ? existsSync(candidate) : candidate === 'php'
);

if (!phpBin) {
  console.error('\nPHP introuvable. Installe XAMPP ou définis PHP_BIN vers php.exe.');
  console.error('Exemple PowerShell : $env:PHP_BIN = "C:\\xampp\\php\\php.exe"');
  process.exit(1);
}

const phpArgs = ['-S', `127.0.0.1:${phpPort}`, '-t', root];
const php = spawn(phpBin, phpArgs, {
  cwd: root,
  stdio: 'inherit',
  shell: isWindows && phpBin === 'php',
});

let vite;
let shuttingDown = false;

function stop(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (vite && !vite.killed) vite.kill();
  if (php && !php.killed) php.kill();
  process.exitCode = code;
}

function waitForPort(host, port, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const attempt = () => {
      const socket = net.createConnection({ host, port });
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`PHP ne répond pas sur ${host}:${port}`));
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

php.once('error', (error) => {
  console.error('Impossible de démarrer PHP :', error.message);
  stop(1);
});

php.once('exit', (code) => {
  if (!shuttingDown) {
    console.error(`Le serveur PHP s'est arrêté (code ${code ?? 'inconnu'}).`);
    stop(code || 1);
  }
});

try {
  console.log(`Démarrage du backend PHP sur http://127.0.0.1:${phpPort}`);
  await waitForPort('127.0.0.1', phpPort);
  console.log('Backend PHP prêt. Démarrage de Vite…');

  const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!existsSync(viteCli)) {
    throw new Error('Vite est introuvable. Exécute npm install avant npm run dev:all.');
  }

  vite = spawn(process.execPath, [viteCli, '--host', '0.0.0.0', '--port', String(vitePort)], {
    cwd: root,
    stdio: 'inherit',
  });

  vite.once('error', (error) => {
    console.error('Impossible de démarrer Vite :', error.message);
    stop(1);
  });
  vite.once('exit', (code) => stop(code || 0));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  stop(1);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => stop(0));
}
