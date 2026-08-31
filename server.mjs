import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Novu } from '@novu/api';

const root = fileURLToPath(new URL('.', import.meta.url));
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 4173);
const apiUrl = process.env.NOVU_API_URL?.trim() || 'https://api.novu.co';
const secretKey = process.env.NOVU_SECRET_KEY?.trim();
const subscriberId = process.env.NOVU_SUBSCRIBER_ID?.trim() || 'on-call:maya';
const novu = secretKey ? new Novu({ secretKey, serverURL: apiUrl }) : null;
const activeTransactions = new Map();

const workflowIds = {
  'incident-created': process.env.NOVU_WORKFLOW_INCIDENT_CREATED || 'critical-incident',
  'operator-note': process.env.NOVU_WORKFLOW_OPERATOR_NOTE || 'incident-note',
  'incident-approved': process.env.NOVU_WORKFLOW_INCIDENT_APPROVED || 'incident-approved',
  'incident-resolved': process.env.NOVU_WORKFLOW_INCIDENT_RESOLVED || 'incident-resolved'
};

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.mp4': 'video/mp4'
};

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(body));
}

async function body(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 128_000) throw new Error('Request body exceeds 128 KB');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function dispatch(request, response) {
  try {
    const data = await body(request);
    const workflowId = workflowIds[data.eventName];
    if (!workflowId || !data.payload || typeof data.payload !== 'object') {
      json(response, 400, { error: 'A supported eventName and payload are required.' });
      return;
    }

    if (!novu) {
      json(response, 202, { accepted: true, mode: 'preview', workflowId, subscriberId });
      return;
    }

    let cancelledFallback = false;
    const incidentId = String(data.payload.incidentId || '');
    if (data.eventName === 'incident-approved' && activeTransactions.has(incidentId)) {
      await novu.cancel(activeTransactions.get(incidentId));
      activeTransactions.delete(incidentId);
      cancelledFallback = true;
    }

    const result = await novu.trigger({
      workflowId,
      to: [{ subscriberId }],
      payload: { ...data.payload, eventName: data.eventName },
      context: { app: 'beacon', environment: process.env.NODE_ENV || 'development' }
    });
    if (data.eventName === 'incident-created' && incidentId && result?.transactionId) {
      activeTransactions.set(incidentId, result.transactionId);
    }
    json(response, 202, {
      accepted: true,
      mode: 'live',
      workflowId,
      subscriberId,
      transactionId: result?.transactionId,
      cancelledFallback
    });
  } catch (error) {
    console.error('[Novu]', error);
    json(response, 502, { error: 'Novu could not accept this workflow event.' });
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://' + (request.headers.host || 'localhost'));
  const pathname = decodeURIComponent(url.pathname);

  if (request.method === 'GET' && pathname === '/api/health') {
    json(response, 200, { status: 'ok', novu: novu ? 'live' : 'preview', apiUrl });
    return;
  }
  if (request.method === 'POST' && pathname === '/api/novu/events') {
    await dispatch(request, response);
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
    'Content-Type': mime[extname(resolved)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  createReadStream(resolved).pipe(response);
}).listen(port, host, () => {
  console.log('Beacon running at http://127.0.0.1:' + port);
  console.log('Novu: ' + (novu ? 'live via ' + apiUrl : 'preview mode'));
});
