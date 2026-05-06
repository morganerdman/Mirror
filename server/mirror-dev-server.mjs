/**
 * Serve Mirror static HTML + POST /api/claude (Anthropic Messages API proxy).
 *
 * Usage (from repo root): ANTHROPIC_API_KEY=sk-ant-... npm run dev
 * Open: http://127.0.0.1:8788/Mirror%20v2.html
 *
 * Reads: ANTHROPIC_API_KEY (required), ANTHROPIC_MODEL (optional),
 * PORT (default 8788), MIRROR_ROOT (default cwd parent of server/).
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildGroundingAppendix, buildLiveGrounding, injectSourcesIntoProfileUpdate } from './source-grounding.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.MIRROR_ROOT || path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8788;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safeJoin(root, pathname) {
  let rel = decodeURIComponent(String(pathname || '')).replace(/^\/+/, '').split('?')[0];
  if (!rel) {
    const v2 = path.join(root, 'Mirror v2.html');
    const idx = path.join(root, 'index.html');
    rel = fs.existsSync(v2) ? 'Mirror v2.html' : fs.existsSync(idx) ? 'index.html' : 'Mirror v2.html';
  }
  const resolved = path.resolve(root, rel);
  const rootResolved = path.resolve(root);
  if (!resolved.startsWith(rootResolved + path.sep) && resolved !== rootResolved) {
    return null;
  }
  return resolved;
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(obj));
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function proxyClaude(body) {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Export it before starting the dev server.');
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: body.system,
      messages: body.messages,
    }),
  });
  const textBody = await r.text();
  if (!r.ok) {
    throw new Error(`Anthropic ${r.status}: ${textBody}`);
  }
  const data = JSON.parse(textBody);
  const text =
    (data.content || [])
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('') || '';
  return text;
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const u = new URL(req.url || '/', `http://${req.headers.host}`);

  if (req.method === 'POST' && u.pathname === '/api/claude') {
    let raw = '';
    for await (const ch of req) raw += ch;
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON' });
      return;
    }
    if (!body || typeof body.system !== 'string' || !Array.isArray(body.messages)) {
      sendJson(res, 400, { error: 'Expected { system: string, messages: Message[] }' });
      return;
    }
    try {
      const grounding = await buildLiveGrounding({ system: body.system, messages: body.messages });
      const system = body.system + buildGroundingAppendix(grounding);
      const text = await proxyClaude({ ...body, system });
      const enrichedText = injectSourcesIntoProfileUpdate(text, grounding);
      sendJson(res, 200, { text: enrichedText, source_status: grounding.source_status });
    } catch (e) {
      console.error(e);
      sendJson(res, 500, { error: String(e.message || e) });
    }
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end();
    return;
  }

  let filePath = safeJoin(ROOT, u.pathname);
  if (!filePath) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  const defaultEntry = fs.existsSync(path.join(ROOT, 'Mirror v2.html'))
    ? 'Mirror%20v2.html'
    : fs.existsSync(path.join(ROOT, 'index.html'))
      ? ''
      : 'Mirror%20v2.html';
  console.log(`Mirror dev: http://127.0.0.1:${PORT}/${defaultEntry}`);
  console.log(`API proxy: POST http://127.0.0.1:${PORT}/api/claude (model: ${MODEL})`);
  if (!API_KEY) console.warn('Warning: ANTHROPIC_API_KEY not set — /api/claude will error until set.');
});
