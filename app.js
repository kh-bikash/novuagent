const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[character]));

const icons = {
  sliders: '<path d="M4 6h16M8 12h12M4 18h16"/><circle cx="7" cy="6" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="11" cy="18" r="2"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7z"/>',
  inbox: '<path d="M4 4h16v13H4z"/><path d="M4 13h4l2 3h4l2-3h4"/>',
  hash: '<path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  arrow: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  moon: '<path d="M20 15.5A8 8 0 1 1 8.5 4 6.5 6.5 0 0 0 20 15.5Z"/>'
};

$$('[data-icon]').forEach(el => {
  const name = el.dataset.icon;
  el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (icons[name] || '') + '</svg>';
});

const ui = {
  trigger: $('#trigger-btn'),
  routing: $('#routing-btn'),
  dialog: $('#routing-dialog'),
  incidentState: $('#incident-state'),
  inboxState: $('#inbox-state'),
  workflowState: $('#workflow-state'),
  thread: $('#thread'),
  receipts: $('#receipts'),
  note: $('#note'),
  sendNote: $('#send-note'),
  hold: $('#hold-btn'),
  approve: $('#approve-btn'),
  outcome: $('#outcome'),
  payload: $('#payload'),
  errorRate: $('#error-rate')
};

let phase = 'ready';
let noteSent = false;

function setStep(name) {
  const order = ['trigger', 'route', 'decide', 'resolve'];
  const current = order.indexOf(name);
  $$('.step').forEach((step, index) => {
    step.classList.toggle('active', index === current);
    step.classList.toggle('done', index < current || phase === 'resolved');
  });
  $$('.flow > i').forEach((line, index) => line.classList.toggle('done', index < current || phase === 'resolved'));
}

function setNode(name, status = 'active') {
  const node = $('[data-node="' + name + '"]');
  if (!node) return;
  node.classList.remove('active', 'done');
  if (status) node.classList.add(status);
}

function setReceipt(name, state, label) {
  const receipt = $('[data-channel="' + name + '"]', ui.receipts);
  receipt.classList.remove('sending', 'sent', 'cancelled');
  receipt.classList.add(state);
  $('small', receipt).textContent = label;
}

function message({ author, body, human = false, facts = [] }) {
  const row = document.createElement('div');
  row.className = 'message' + (human ? ' human' : '');
  const factMarkup = facts.length ? '<div class="message-facts">' + facts.map(fact => '<i>' + fact + '</i>').join('') + '</div>' : '';
  row.innerHTML =
    '<span class="message-avatar">' + (human ? 'MK' : 'N') + '</span>' +
    '<div class="message-body"><span><b>' + author + '</b><time>now</time></span><p>' + body + '</p>' + factMarkup + '</div>';
  ui.thread.append(row);
  ui.thread.scrollTop = ui.thread.scrollHeight;
  return row;
}

function toast(title, detail) {
  const item = document.createElement('div');
  item.className = 'toast';
  item.innerHTML = '<b>' + title + '</b><span>' + detail + '</span>';
  $('#toasts').append(item);
  setTimeout(() => item.remove(), 2600);
}

async function novuEvent(eventName, payload = {}) {
  try {
    const response = await fetch('/api/novu/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, payload })
    });
    if (!response.ok) throw new Error('Workflow was not accepted');
    return response.json();
  } catch (error) {
    console.warn(error);
    return { mode: 'preview', accepted: true };
  }
}

function reset() {
  phase = 'ready';
  noteSent = false;
  ui.trigger.disabled = false;
  ui.trigger.innerHTML = '<span data-icon="bolt"></span>Trigger incident';
  $('[data-icon]', ui.trigger).innerHTML = '<svg viewBox="0 0 24 24">' + icons.bolt + '</svg>';
  ui.incidentState.className = 'state';
  ui.incidentState.innerHTML = '<i></i><b>Ready</b>';
  ui.inboxState.className = 'inbox-state';
  ui.inboxState.innerHTML = '<i></i>Standing by';
  ui.workflowState.className = 'workflow-state';
  ui.workflowState.textContent = 'READY';
  ui.thread.innerHTML = '<div class="empty" id="empty"><div><span class="novu-logo">N</span></div><b>Waiting for a workflow</b><p>Trigger the incident to see Novu route a decision to the on-call engineer.</p></div>';
  ui.note.value = '';
  ui.note.disabled = true;
  ui.sendNote.disabled = true;
  ui.hold.disabled = true;
  ui.approve.disabled = true;
  ui.outcome.hidden = true;
  ui.payload.hidden = false;
  ui.errorRate.textContent = '12.8%';
  ['event', 'inbox', 'slack'].forEach(name => setNode(name, ''));
  $('[data-node="email"]').className = 'node muted';
  setReceipt('Inbox', '', 'Ready');
  setReceipt('Slack', '', 'Ready');
  setReceipt('Email', '', 'Fallback');
  setStep('trigger');
}

async function triggerIncident() {
  if (phase === 'resolved') reset();
  if (phase !== 'ready') return;
  phase = 'routing';
  ui.trigger.disabled = true;
  ui.trigger.textContent = 'Dispatching…';
  ui.incidentState.className = 'state live';
  ui.incidentState.innerHTML = '<i></i><b>Active</b>';
  ui.inboxState.className = 'inbox-state live';
  ui.inboxState.innerHTML = '<i></i>Routing';
  ui.workflowState.className = 'workflow-state running';
  ui.workflowState.textContent = 'RUNNING';
  setNode('event');
  setReceipt('Inbox', 'sending', 'Sending');
  setReceipt('Slack', 'sending', 'Sending');
  await novuEvent('incident-created', {
    incidentId: 'INC-2048',
    severity: 'P1',
    service: 'Checkout API',
    errorRate: '12.8%',
    failedOrders: 184,
    deploy: '#8421',
    recommendation: 'Roll back deploy #8421'
  });
  await wait(650);
  setNode('event', 'done');
  setStep('route');
  setNode('inbox');
  await wait(420);
  setNode('inbox', 'done');
  setReceipt('Inbox', 'sent', 'Delivered');
  setNode('slack');
  await wait(420);
  setNode('slack', 'done');
  setReceipt('Slack', 'sent', 'Delivered');
  $('#empty')?.remove();
  message({
    author: 'Novu workflow',
    body: '<b>Approval required:</b> error rate reached 12.8% after deploy #8421. Rollback is the recommended action.',
    facts: ['184 failed', '96% confidence', '3 min recovery']
  });
  phase = 'decision';
  setStep('decide');
  ui.workflowState.className = 'workflow-state waiting';
  ui.workflowState.textContent = 'WAITING FOR ACTION';
  ui.inboxState.innerHTML = '<i></i>Decision needed';
  ui.note.disabled = false;
  ui.sendNote.disabled = false;
  ui.hold.disabled = false;
  ui.approve.disabled = false;
  ui.trigger.textContent = 'Workflow active';
  toast('Delivered by Novu', 'Inbox and Slack reached Maya immediately.');
}

async function sendNote() {
  const text = ui.note.value.trim();
  if (!text || phase !== 'decision') return;
  ui.note.value = '';
  ui.note.disabled = true;
  ui.sendNote.disabled = true;
  message({ author: 'Maya Kapoor', body: escapeHtml(text), human: true });
  await novuEvent('operator-note', { incidentId: 'INC-2048', note: text });
  await wait(650);
  message({
    author: 'Incident context',
    body: 'Deploy #8421 is the only change in the failure window. The previous release passed the payment smoke tests.',
    facts: ['Rollback safe', 'No schema change']
  });
  noteSent = true;
  ui.note.disabled = false;
  ui.sendNote.disabled = false;
}

async function approve() {
  if (phase !== 'decision') return;
  phase = 'resolving';
  ui.approve.disabled = true;
  ui.hold.disabled = true;
  ui.note.disabled = true;
  ui.sendNote.disabled = true;
  ui.approve.textContent = 'Publishing decision…';
  setStep('resolve');
  ui.workflowState.className = 'workflow-state running';
  ui.workflowState.textContent = 'PUBLISHING UPDATE';
  message({ author: 'Maya Kapoor', body: 'Rollback approved. Publish the decision to the incident timeline.', human: true });
  await novuEvent('incident-approved', { incidentId: 'INC-2048', approvedBy: 'Maya Kapoor', deploy: '#8421', noteAdded: noteSent });
  await wait(850);
  message({ author: 'Novu workflow', body: '<b>Incident resolved.</b> Checkout health recovered and every active channel received the lifecycle update.', facts: ['1.1% errors', 'Email cancelled'] });
  await novuEvent('incident-resolved', { incidentId: 'INC-2048', errorRate: '1.1%', recoveryTime: '2m 41s' });
  phase = 'resolved';
  setStep('resolve');
  ui.incidentState.className = 'state resolved';
  ui.incidentState.innerHTML = '<i></i><b>Resolved</b>';
  ui.inboxState.className = 'inbox-state resolved';
  ui.inboxState.innerHTML = '<i></i>Complete';
  ui.workflowState.className = 'workflow-state done';
  ui.workflowState.textContent = 'COMPLETED';
  ui.errorRate.textContent = '1.1%';
  ui.payload.hidden = true;
  ui.outcome.hidden = false;
  setReceipt('Inbox', 'sent', 'Updated');
  setReceipt('Slack', 'sent', 'Updated');
  setReceipt('Email', 'cancelled', 'Cancelled');
  ui.approve.innerHTML = '<span data-icon="check"></span>Rollback approved';
  $('[data-icon]', ui.approve).innerHTML = '<svg viewBox="0 0 24 24">' + icons.check + '</svg>';
  ui.trigger.disabled = false;
  ui.trigger.textContent = 'Run again';
  toast('Lifecycle complete', 'Resolution delivered; fallback escalation cancelled.');
}

ui.trigger.addEventListener('click', triggerIncident);
ui.routing.addEventListener('click', () => ui.dialog.showModal());
ui.sendNote.addEventListener('click', sendNote);
ui.note.addEventListener('keydown', event => {
  if (event.key === 'Enter') sendNote();
});
ui.approve.addEventListener('click', approve);
ui.hold.addEventListener('click', () => toast('Workflow paused', 'Novu keeps the decision open for Maya.'));

fetch('/api/health').then(response => response.json()).then(data => {
  $('#novu-mode').textContent = data.novu === 'live' ? 'Live workflow delivery' : 'Preview delivery';
}).catch(() => {
  $('#novu-mode').textContent = 'Preview delivery';
});
