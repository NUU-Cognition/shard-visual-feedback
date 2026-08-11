#!/usr/bin/env node
// Serve the annotate tool over http://127.0.0.1 and open it in the browser.
//
// Why a server instead of opening the file directly: the tool copies the
// finished annotation to the clipboard via navigator.clipboard.write(), which
// requires a secure context. A bare file:// URL is not reliably one, so the
// copy silently degrades to a download. Serving over loopback fixes that.
//
// Invocation: flint shard vf annotate [--port <n>] [--no-open]
// Outputs: the URL being served. Runs until interrupted (Ctrl+C).

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_PORT = 7333;

function parseArgs(argv) {
  const args = { port: DEFAULT_PORT, open: true };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 1 || n > 65535) {
        fail(`--port expects an integer 1-65535, got "${argv[i]}"`);
      }
      args.port = n;
    } else if (argv[i] === '--no-open') {
      args.open = false;
    } else {
      fail(`unknown argument "${argv[i]}"`);
    }
  }
  return args;
}

function fail(msg) {
  process.stderr.write(`annotate: ${msg}\n`);
  process.exit(1);
}

// The asset sits beside this script's parent. Dev sources carry the dev-
// prefix; installed copies do not. Try both rather than guessing which
// lifecycle mode we are running from.
function resolveAsset() {
  const assets = path.join(__dirname, '..', 'assets');
  for (const name of ['ast-vf-annotate.html', 'dev-ast-vf-annotate.html']) {
    const full = path.join(assets, name);
    if (fs.existsSync(full)) return full;
  }
  fail(`annotate asset not found in ${assets}`);
}

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start'
    : 'xdg-open';
  try {
    spawn(cmd, [url], { detached: true, stdio: 'ignore', shell: process.platform === 'win32' }).unref();
  } catch {
    // Opening is a convenience — the URL is printed either way.
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const asset = resolveAsset();
  const html = fs.readFileSync(asset);

  const server = http.createServer((req, res) => {
    // Single-file tool: every path serves the same document.
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(html);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      fail(`port ${args.port} is already in use — pass --port <n> to pick another`);
    }
    fail(err.message);
  });

  server.listen(args.port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${args.port}/`;
    // NOTE: `flint shard <sh> <script>` buffers BOTH child streams and relays
    // them only when the process exits. Since this server runs until Ctrl+C,
    // none of the following reaches the user while it matters — it surfaces
    // only when run directly under node, or after the server is stopped.
    // The browser auto-open is therefore the real affordance; the URL is
    // deterministic (127.0.0.1:<port>) so the caller can state it instead.
    // Errors are unaffected: fail() exits, which flushes the buffer.
    process.stderr.write(`${url}\n`);
    process.stderr.write('Paste a screenshot (cmd-ctrl-shift-4 then cmd-v), draw, copy.\n');
    process.stderr.write('Ctrl+C to stop.\n');
    if (args.open) openBrowser(url);
  });

  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      server.close();
      process.exit(0);
    });
  }
}

main();
