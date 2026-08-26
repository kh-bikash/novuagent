import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Novu } from '@novu/api';

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '0.0.0.0';
const root = fileURLToPath(new URL('.', import.meta.url));
const secretKey = process.env.NOVU_SECRET_KEY?.trim();
const apiUrl = process.env.NOVU_API_URL?.trim() || 'https://api.novu.co';
const subscriberId = process.env.NOVU_SUBSCRIBER_ID?.trim() || 'on-call:maya';
const workflowIds = {
  'incident-created': process.env.NOVU_WORKFLOW_INCIDENT_CREATED || process.env.NOVU_WORKFLOW_ID || 'critical-incident',
  'incident-resolved': process.env.NOVU_WORKFLOW_INCIDENT_RESOLVED || 'incident-resolved',
  'incident-rejected': process.env.NOVU_WORKFLOW_INCIDENT_REJECTED || 'incident-action-rejected',
  'incident-snoozed': process.env.NOVU_WORKFLOW_INCIDENT_SNOOZED || 'incident-snoozed'
};
const novu = secretKey ? new Novu({ secretKey, serverURL: apiUrl }) : null;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 128_000) throw new Error('Request body is too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function triggerNovu(request, response) {
  try {
    const { eventName, payload } = await readJson(request);
    if (typeof eventName !== 'string' || !payload || typeof payload !== 'object') {
      sendJson(response, 400, { error: 'eventName and payload are required' });
      return;
    }

    const workflowId = workflowIds[eventName];
    if (!workflowId) {
      sendJson(response, 202, { mode: novu ? 'live' : 'preview', skipped: true, reason: 'This event does not trigger a notification workflow.' });
      return;
    }

    if (!novu) {
      sendJson(response, 202, { mode: 'preview', workflowId, subscriberId, accepted: true });
      return;
    }

    await novu.trigger({
      workflowId,
      to: [{ subscriberId }],
      payload: { ...payload, eventName },
      context: { app: 'relay', environment: process.env.NODE_ENV || 'development' }
    });
    sendJson(response, 202, { mode: 'live', workflowId, subscriberId, accepted: true });
  } catch (error) {
    console.error('[Novu trigger failed]', error);
    sendJson(response, 502, { error: 'Novu could not accept the workflow trigger.' });
  }
}

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);

  if (pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { status: 'ok', novu: novu ? 'live' : 'preview', apiUrl });
    return;
  }

  if (pathname === '/api/novu/events' && request.method === 'POST') {
    await triggerNovu(request, response);
    return;
  }

  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolved = normalize(join(root, relative));
  if (!resolved.startsWith(normalize(root)) || !existsSync(resolved) || statSync(resolved).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': types[extname(resolved)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  createReadStream(resolved).pipe(response);
}).listen(port, host, () => {
  console.log(`Relay is running at http://127.0.0.1:${port}`);
  console.log(`Novu mode: ${novu ? `live (${apiUrl})` : 'preview (set NOVU_SECRET_KEY for live delivery)'}`);
});
