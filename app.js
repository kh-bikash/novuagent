const STORAGE_KEY = 'relay-product-v1';

const icons = {
  radio: '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.48M7.76 16.24a6 6 0 0 1 0-8.48M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>',
  layout: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9-11a.5.5 0 0 1 .87.44l-1.7 6.8A1 1 0 0 0 12.36 10H20a1 1 0 0 1 .78 1.63l-9 11a.5.5 0 0 1-.87-.44l1.7-6.8A1 1 0 0 0 11.64 14Z"/>',
  bell: '<path d="M10.27 21a2 2 0 0 0 3.46 0"/><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.88 18 12.36 18 8A6 6 0 0 0 6 8c0 4.36-1.41 5.88-2.74 7.33"/>',
  messages: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  bot: '<rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/>',
  panel: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/><path d="m9 12 2 2 4-4"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  webhook: '<path d="M18.17 8A3 3 0 1 1 19 13.83M6 8.17A3 3 0 1 1 5.17 14M12 18a3 3 0 1 1-2.83-2"/><path d="M12 2v4M3.5 17.5l3.5-2M17 15.5l3.5 2"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>'
};

function svgIcon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.activity}</svg>`;
}

function hydrateIcons(scope = document) {
  scope.querySelectorAll('[data-icon]').forEach((element) => {
    const name = element.dataset.icon;
    if (!element.querySelector('svg')) element.insertAdjacentHTML('afterbegin', svgIcon(name));
  });
}

const now = Date.now();
const seedState = () => ({
  incidents: [
    {
      id: 1001, title: 'Checkout failures spiking', service: 'Payments API', severity: 'critical', state: 'action', priority: 'P1',
      summary: 'Error rate crossed 12% after deploy #8421.', createdAt: now - 2 * 60_000, stage: 3,
      recommendation: 'I traced the spike to payments-api deploy #8421. The previous version is healthy. Roll back now?',
      facts: ['Impact: 184 failed checkouts', 'Confidence: 96%', 'Estimated recovery: 3 minutes'],
      messages: [], outcome: null
    },
    {
      id: 1002, title: 'Warehouse sync is delayed', service: 'Data pipeline', severity: 'warning', state: 'action', priority: 'P2',
      summary: 'Orders are 24 minutes behind the freshness target.', createdAt: now - 18 * 60_000, stage: 3,
      recommendation: 'The primary worker is saturated. I can shift the next batch to the standby pool and preserve ordering.',
      facts: ['Impact: Analytics only', 'Confidence: 88%', 'Estimated recovery: 11 minutes'],
      messages: [], outcome: null
    },
    {
      id: 1003, title: 'Login latency recovered', service: 'Authentication', severity: 'resolved', state: 'resolved', priority: 'Resolved',
      summary: 'Traffic was rerouted and p95 returned to normal.', createdAt: now - 67 * 60_000, stage: 4,
      recommendation: 'Traffic has been rerouted to the healthy region and login latency is back within the SLO.',
      facts: ['Peak p95: 2.4 seconds', 'Current p95: 310 ms', 'Resolved automatically'],
      messages: [{ role: 'agent', text: 'Resolution confirmed. I updated the in-app and Slack messages in place.' }], outcome: 'Resolved automatically'
    },
    {
      id: 1004, title: 'Invoice export needs approval', service: 'Billing', severity: 'warning', state: 'snoozed', priority: 'Snoozed',
      summary: 'A customer-requested export is ready to release.', createdAt: now - 3 * 3_600_000, stage: 2,
      recommendation: 'The export passed validation and is ready to share with the account owner.',
      facts: ['Customer: Northstar Labs', 'Rows: 2,418', 'Retention: 7 days'],
      messages: [], outcome: 'Snoozed until 16:30'
    }
  ],
  activity: [
    { id: 1, kind: 'resolved', text: 'Authentication incident resolved', at: now - 67 * 60_000 },
    { id: 2, kind: 'notify', text: 'Billing approval sent to Maya', at: now - 3 * 3_600_000 },
    { id: 3, kind: 'workflow', text: 'Data pipeline workflow triggered', at: now - 18 * 60_000 }
  ],
  preferences: {
    channels: { inbox: true, slack: true, email: true, sms: false },
    quietStart: '22:00', quietEnd: '07:00', digest: 'critical-live'
  },
  metrics: { notifications: 1482, medianAck: 4.2, autoResolved: 68 }
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.incidents && saved?.preferences ? saved : seedState();
  } catch {
    return seedState();
  }
}

let state = loadState();
let currentView = location.hash.slice(1) || 'inbox';
if (!['overview', 'inbox', 'workflows', 'channels'].includes(currentView)) currentView = 'inbox';
let selectedIncidentId = state.incidents.find((item) => item.state === 'action')?.id || state.incidents[0]?.id;
let inboxFilter = 'all';
let inboxQuery = '';
let novuMode = 'preview';

const viewRoot = document.getElementById('view-root');
const viewTitle = document.getElementById('view-title');
const viewEyebrow = document.getElementById('view-eyebrow');
const settingsDialog = document.getElementById('settings-dialog');

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateNavCount();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function relativeTime(timestamp) {
  const seconds = Math.max(1, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function updateNavCount() {
  const count = state.incidents.filter((incident) => incident.state === 'action').length;
  document.getElementById('nav-count').textContent = count;
  document.getElementById('nav-count').hidden = count === 0;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('relay-theme', theme);
  const toggle = document.getElementById('theme-toggle');
  toggle.innerHTML = svgIcon(theme === 'dark' ? 'sun' : 'moon');
  toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}

function setActiveNav() {
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('is-active', button.dataset.view === currentView));
}

function setNovuMode(mode) {
  novuMode = mode === 'live' ? 'live' : 'preview';
  const title = document.getElementById('novu-connection-title');
  const copy = document.getElementById('novu-connection-copy');
  if (title) title.textContent = novuMode === 'live' ? 'Novu live' : 'Novu preview';
  if (copy) copy.textContent = novuMode === 'live' ? 'Workflow API connected' : 'Ready for live credentials';
  const trace = document.getElementById('novu-trace-state');
  if (trace) trace.textContent = novuMode === 'live' ? 'Novu event live' : 'Local preview';
}

async function sendToNovu(eventName, payload) {
  try {
    const response = await fetch('/api/novu/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, payload })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Novu request failed');
    setNovuMode(result.mode);
    return result;
  } catch (error) {
    console.error('[Relay Novu adapter]', error);
    toast('Novu delivery failed — local workflow preserved', 'x');
    return null;
  }
}

function dispatch(eventName, payload = {}) {
  const labels = {
    'incident-created': `Incident workflow triggered for ${payload.service}`,
    'incident-resolved': `${payload.service} action approved and channels updated`,
    'incident-rejected': `${payload.service} action rejected by Maya`,
    'incident-snoozed': `${payload.service} notification snoozed`,
    'agent-message': `Agent conversation continued for ${payload.service}`
  };
  state.activity.unshift({ id: Date.now(), kind: eventName.includes('resolved') ? 'resolved' : eventName.includes('message') ? 'message' : 'workflow', text: labels[eventName] || eventName, at: Date.now() });
  state.activity = state.activity.slice(0, 12);
  console.info('[Relay dispatch]', eventName, payload);
  void sendToNovu(eventName, payload);
}

function toast(message, iconName = 'check') {
  const stack = document.getElementById('toast-stack');
  const item = document.createElement('div');
  item.className = 'toast';
  item.innerHTML = `${svgIcon(iconName)}<span>${escapeHtml(message)}</span>`;
  stack.append(item);
  window.setTimeout(() => item.remove(), 2800);
}

function incidentBadge(incident) {
  if (incident.state === 'resolved') return '<span class="badge positive">Resolved</span>';
  if (incident.state === 'snoozed') return '<span class="badge neutral">Snoozed</span>';
  return `<span class="badge ${incident.severity === 'critical' ? 'danger' : 'warning'}">Action needed</span>`;
}

function enabledChannels() {
  const map = { inbox: ['panel', 'In-app'], slack: ['hash', 'Slack'], email: ['mail', 'Email fallback'], sms: ['smartphone', 'SMS'] };
  return Object.entries(state.preferences.channels).filter(([, enabled]) => enabled).map(([key]) => ({ key, icon: map[key][0], label: map[key][1] }));
}

function filteredIncidents() {
  const query = inboxQuery.trim().toLowerCase();
  return state.incidents.filter((incident) => {
    const filterMatch = inboxFilter === 'all' || incident.state === inboxFilter;
    const queryMatch = !query || `${incident.title} ${incident.service} ${incident.summary}`.toLowerCase().includes(query);
    return filterMatch && queryMatch;
  });
}

function renderIncidentList() {
  const incidents = filteredIncidents();
  if (!incidents.some((incident) => incident.id === selectedIncidentId) && incidents.length) selectedIncidentId = incidents[0].id;
  if (!incidents.length) return `<div class="empty-state"><span class="empty-icon">${svgIcon('inbox')}</span><strong>No matching incidents</strong><p>Try another filter or search phrase.</p></div>`;
  return incidents.map((incident) => `
    <button class="incident-item" type="button" data-incident-id="${incident.id}" aria-selected="${incident.id === selectedIncidentId}">
      <span class="severity-dot ${incident.severity}" aria-hidden="true"></span>
      <span>
        <span class="incident-row"><strong>${escapeHtml(incident.title)}</strong><time>${relativeTime(incident.createdAt)}</time></span>
        <span class="incident-summary">${escapeHtml(incident.summary)}</span>
        <span class="incident-meta">${incidentBadge(incident)}<span>${escapeHtml(incident.service)}</span></span>
      </span>
    </button>`).join('');
}

function renderTrack(incident) {
  const steps = [['zap', 'Event'], ['bell', 'Novu Notify'], ['messages', 'Novu Connect'], ['check', 'Resolve']];
  return `<div class="workflow-track" aria-label="Workflow progress">${steps.map(([iconName, label], index) => `
    <div class="track-step ${index < incident.stage ? 'is-done' : ''}">
      <span class="track-node">${svgIcon(iconName)}</span><span>${label}</span>
    </div>`).join('')}</div>`;
}

function agentReplyFor(text, incident) {
  const query = text.toLowerCase();
  if (query.includes('change') || query.includes('deploy')) return `Deploy #8421 changed the payment retry policy and connection pool size. The pool change aligns exactly with the first error spike.`;
  if (query.includes('impact') || query.includes('customer')) return `${incident.facts[0]}. No data loss is detected, and affected requests can be retried safely after recovery.`;
  if (query.includes('risk') || query.includes('safe')) return `The proposed action is low risk. I verified the previous release is healthy and preserved a rollback checkpoint.`;
  return `I checked the traces, deployment history, and current SLOs. My recommendation is unchanged: proceed with the proposed action and monitor for five minutes.`;
}

function renderMessages(incident) {
  return incident.messages.map((message) => message.role === 'user'
    ? `<div class="message user-message"><div class="message-bubble"><p>${escapeHtml(message.text)}</p></div></div>`
    : `<div class="message"><span class="agent-avatar">${svgIcon('bot')}</span><div class="message-bubble"><strong>Atlas agent</strong><p>${escapeHtml(message.text)}</p></div></div>`
  ).join('');
}

function renderIncidentDetail() {
  const incident = state.incidents.find((item) => item.id === selectedIncidentId);
  if (!incident) return '<section class="incident-detail"><div class="empty-state"><span class="empty-icon">' + svgIcon('search') + '</span><strong>Select an incident</strong><p>Choose an item to inspect its workflow.</p></div></section>';
  const isAction = incident.state === 'action';
  return `<section class="incident-detail" aria-label="Selected incident detail">
    <div class="detail-title">
      <div><p class="eyebrow">${escapeHtml(incident.service).toUpperCase()}</p><h2>${escapeHtml(incident.title)}</h2><p>${escapeHtml(incident.summary)}</p></div>
      ${incidentBadge(incident)}
    </div>
    ${renderTrack(incident)}
    <div class="novu-trace" aria-label="Novu workflow trace">
      <span><small>WORKFLOW</small><strong>critical-incident</strong></span>
      <span><small>SUBSCRIBER</small><strong>on-call:maya</strong></span>
      <span><small>DELIVERY</small><strong>${enabledChannels().length} active channels</strong></span>
      <span class="trace-live"><i></i><strong id="novu-trace-state">${novuMode === 'live' ? 'Novu event live' : 'Local preview'}</strong></span>
    </div>
    <div class="agent-thread" id="agent-thread">
      <div class="message">
        <span class="agent-avatar">${svgIcon('bot')}</span>
        <div class="message-bubble"><strong>Atlas agent</strong><p>${escapeHtml(incident.recommendation)}</p><ul>${incident.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul></div>
      </div>
      ${renderMessages(incident)}
      ${incident.outcome ? `<div class="message"><span class="agent-avatar">${svgIcon('check')}</span><div class="message-bubble"><strong>Workflow update</strong><p>${escapeHtml(incident.outcome)}</p></div></div>` : ''}
    </div>
    ${isAction ? `<div class="action-row">
      <button class="primary-button" type="button" data-action="approve">${svgIcon('check')}Approve action</button>
      <button class="secondary-button" type="button" data-action="reject">${svgIcon('x')}Reject</button>
      <button class="ghost-button" type="button" data-action="snooze">${svgIcon('clock')}Snooze 30m</button>
    </div>` : ''}
    <form class="composer" id="agent-composer">
      <label class="sr-only" for="agent-question">Ask Atlas about this incident</label>
      <textarea id="agent-question" rows="1" placeholder="Ask Atlas about impact, risk, or the last deploy…"></textarea>
      <button class="primary-button" type="submit" aria-label="Send message">${svgIcon('send')}<span>Send</span></button>
    </form>
    <div class="delivery-list"><span>Delivered through</span>${enabledChannels().map((channel) => `<span class="delivery-chip">${svgIcon(channel.icon)}${channel.label}</span>`).join('')}</div>
  </section>`;
}

function renderInbox() {
  viewRoot.innerHTML = `<div class="inbox-layout">
    <section class="inbox-panel" aria-label="Incident list">
      <div class="section-title"><h2>Incident inbox</h2><p>One event, routed to the right human.</p></div>
      <div class="inbox-toolbar">
        <div class="segmented" role="group" aria-label="Filter incidents">
          ${[['all', 'All'], ['action', 'Action needed'], ['resolved', 'Resolved'], ['snoozed', 'Snoozed']].map(([value, label]) => `<button type="button" data-filter="${value}" aria-pressed="${inboxFilter === value}">${label}</button>`).join('')}
        </div>
        <div class="search-box">${svgIcon('search')}<label class="sr-only" for="incident-search">Search incidents</label><input id="incident-search" type="search" value="${escapeHtml(inboxQuery)}" placeholder="Search incidents or services" autocomplete="off"/><kbd>/</kbd></div>
      </div>
      <div class="incident-list" role="listbox" id="incident-list">${renderIncidentList()}</div>
    </section>
    ${renderIncidentDetail()}
  </div>`;
}

function renderOverview() {
  const active = state.incidents.filter((item) => item.state === 'action').length;
  const resolved = state.incidents.filter((item) => item.state === 'resolved').length;
  viewRoot.innerHTML = `<section class="overview">
    <div class="overview-hero">
      <div><p class="eyebrow">BUILT ON OPEN-SOURCE NOVU</p><h2>One incident. One conversation. Every channel.</h2><p>Relay uses Novu Notify for reliable multi-channel delivery and Novu Connect for contextual agent conversations with human approval.</p><div class="action-row"><button class="primary-button" type="button" data-run-workflow>${svgIcon('zap')}Run end-to-end workflow</button><button class="secondary-button" type="button" data-go-inbox>${svgIcon('inbox')}Open incident inbox</button></div></div>
      <div class="hero-visual" aria-label="Novu workflow delivery health"><div class="signal-line"><span style="width:92%"></span></div><div class="signal-line"><span style="width:72%"></span></div><div class="signal-line"><span style="width:84%"></span></div><small>Event → Notify → Connect → Resolve</small></div>
    </div>
    <div class="novu-story" aria-label="How Relay uses Novu">
      <article><span class="story-icon">${svgIcon('bell')}</span><div><small>NOVU NOTIFY</small><strong>Route the event once</strong><p>Inbox, Slack, email fallback, and subscriber preferences run from one workflow.</p></div></article>
      <article><span class="story-icon">${svgIcon('messages')}</span><div><small>NOVU CONNECT</small><strong>Continue in context</strong><p>The agent keeps the thread, proposes an action, and waits for human approval.</p></div></article>
      <article><span class="story-icon">${svgIcon('check')}</span><div><small>LIVE STATE</small><strong>Update every message</strong><p>The approved resolution is synchronized in place across active channels.</p></div></article>
    </div>
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-kicker"><span>Active incidents</span>${svgIcon('activity')}</div><strong>${active}</strong><p>${active ? 'Awaiting human attention' : 'Everything is quiet'}</p></article>
      <article class="stat-card"><div class="stat-kicker"><span>Median acknowledgment</span>${svgIcon('clock')}</div><strong>${state.metrics.medianAck}m</strong><p>31% faster this week</p></article>
      <article class="stat-card"><div class="stat-kicker"><span>Auto-resolved</span>${svgIcon('bot')}</div><strong>${state.metrics.autoResolved}%</strong><p>With policy-safe actions</p></article>
      <article class="stat-card"><div class="stat-kicker"><span>Notifications routed</span>${svgIcon('send')}</div><strong>${state.metrics.notifications.toLocaleString()}</strong><p>Across ${enabledChannels().length} active channels</p></article>
    </div>
    <div class="overview-grid">
      <article class="activity-panel"><h3>Recent workflow activity</h3><div class="activity-list">${state.activity.slice(0,5).map((item) => `<div class="activity-row"><span class="activity-icon">${svgIcon(item.kind === 'resolved' ? 'check' : item.kind === 'message' ? 'messages' : 'workflow')}</span><span>${escapeHtml(item.text)}</span><time>${relativeTime(item.at)}</time></div>`).join('')}</div></article>
      <article class="activity-panel"><h3>Resolution posture</h3><div class="activity-list"><div class="activity-row"><span class="activity-icon">${svgIcon('shield')}</span><span>Human approval enforced</span><span class="badge positive">On</span></div><div class="activity-row"><span class="activity-icon">${svgIcon('send')}</span><span>Channel fallbacks</span><span class="badge positive">Healthy</span></div><div class="activity-row"><span class="activity-icon">${svgIcon('activity')}</span><span>Resolved incidents</span><strong>${resolved}</strong></div></div></article>
    </div>
  </section>`;
}

const workflowDefinitions = [
  { id: 'incident-created', name: 'Critical incident', description: 'Routes a P1 event to Inbox and Slack, then escalates to email after five minutes.', status: 'Live', runs: 412, icon: 'activity', nodes: ['zap','bell','messages','check'] },
  { id: 'approval-request', name: 'Human approval', description: 'Pauses a proposed agent action until an authorized operator approves or rejects it.', status: 'Live', runs: 86, icon: 'shield', nodes: ['bot','user','check'] },
  { id: 'incident-digest', name: 'Incident digest', description: 'Bundles lower-priority events into a concise scheduled briefing for the on-call team.', status: 'Live', runs: 128, icon: 'clock', nodes: ['inbox','workflow','mail'] }
];

function renderWorkflows() {
  viewRoot.innerHTML = `<section class="page-stack"><div class="page-head"><div><p class="eyebrow">NOVU WORKFLOW ENGINE</p><h2>Communication workflows</h2><p>Trigger once. Novu handles routing, approvals, fallbacks, and message state updates.</p></div><button class="primary-button" type="button" data-run-workflow>${svgIcon('plus')}Run live test</button></div><div class="workflow-grid">${workflowDefinitions.map((flow) => `
    <article class="workflow-card"><div class="workflow-card-head"><span class="workflow-icon">${svgIcon(flow.icon)}</span><span class="badge positive">${flow.status}</span></div><h3>${flow.name}</h3><p>${flow.description}</p><div class="workflow-nodes">${flow.nodes.map((node, index) => `${index ? '<span class="workflow-link"></span>' : ''}<span class="workflow-node">${svgIcon(node)}</span>`).join('')}</div><div class="workflow-meta"><span>${flow.runs} runs</span><button class="ghost-button" type="button" data-run-workflow>${svgIcon('rotate')}Test</button></div></article>`).join('')}</div></section>`;
}

const channelDefinitions = [
  { key: 'inbox', name: 'In-app Inbox', description: 'Rich notifications inside Relay, including approval actions and live state.', icon: 'panel', detail: 'Primary' },
  { key: 'slack', name: 'Slack', description: 'Threaded agent conversations and approvals where the team already works.', icon: 'hash', detail: '#on-call' },
  { key: 'email', name: 'Email fallback', description: 'Escalates important events when the primary channel is not acknowledged.', icon: 'mail', detail: 'After 5m' },
  { key: 'sms', name: 'SMS escalation', description: 'Reserved for urgent P1 incidents during the configured on-call window.', icon: 'smartphone', detail: 'Critical only' }
];

function renderChannels() {
  viewRoot.innerHTML = `<section class="page-stack"><div class="page-head"><div><p class="eyebrow">NOVU SUBSCRIBER PREFERENCES</p><h2>Delivery channels</h2><p>Choose where this subscriber can be reached. The demo persists preferences locally; production maps these controls to Novu.</p></div><button class="secondary-button" type="button" data-open-settings>${svgIcon('settings')}Quiet hours</button></div><div class="channel-grid">${channelDefinitions.map((channel) => `
    <article class="channel-card"><div class="channel-card-head"><span class="channel-icon">${svgIcon(channel.icon)}</span><span class="badge neutral">${channel.detail}</span></div><h3>${channel.name}</h3><p>${channel.description}</p><div class="channel-row"><span>${state.preferences.channels[channel.key] ? 'Enabled' : 'Disabled'}</span><label class="toggle"><input type="checkbox" data-channel="${channel.key}" ${state.preferences.channels[channel.key] ? 'checked' : ''} aria-label="Toggle ${channel.name}"><span></span></label></div></article>`).join('')}</div></section>`;
}

function renderSettings() {
  const prefs = state.preferences;
  document.getElementById('settings-content').innerHTML = `<div class="settings-body">
    ${channelDefinitions.map((channel) => `<div class="setting-row"><div><strong>${channel.name}</strong><p>${channel.detail}</p></div><label class="toggle"><input type="checkbox" data-channel="${channel.key}" ${prefs.channels[channel.key] ? 'checked' : ''} aria-label="Toggle ${channel.name}"><span></span></label></div>`).join('')}
    <div class="field-grid"><div class="field"><label for="quiet-start">Quiet hours start</label><select id="quiet-start" data-preference="quietStart">${['20:00','21:00','22:00','23:00'].map((value) => `<option ${prefs.quietStart === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div><div class="field"><label for="quiet-end">Quiet hours end</label><select id="quiet-end" data-preference="quietEnd">${['06:00','07:00','08:00','09:00'].map((value) => `<option ${prefs.quietEnd === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div></div>
    <div class="field"><label for="digest-mode">Delivery strategy</label><select id="digest-mode" data-preference="digest"><option value="critical-live" ${prefs.digest === 'critical-live' ? 'selected' : ''}>P1 live, bundle everything else</option><option value="all-live" ${prefs.digest === 'all-live' ? 'selected' : ''}>Deliver every event immediately</option><option value="digest" ${prefs.digest === 'digest' ? 'selected' : ''}>Scheduled digests only</option></select></div>
  </div><div class="dialog-actions"><button class="ghost-button danger-button" type="button" data-reset-demo>${svgIcon('rotate')}Reset demo data</button><button class="primary-button" value="default">Done</button></div>`;
}

function renderView() {
  const metadata = {
    overview: ['COMMAND CENTER', 'Operations overview'],
    inbox: ['OPERATIONS', 'Incident inbox'],
    workflows: ['AUTOMATION', 'Workflows'],
    channels: ['DELIVERY', 'Channels']
  }[currentView];
  viewEyebrow.textContent = metadata[0];
  viewTitle.textContent = metadata[1];
  setActiveNav();
  if (currentView === 'overview') renderOverview();
  else if (currentView === 'workflows') renderWorkflows();
  else if (currentView === 'channels') renderChannels();
  else renderInbox();
  hydrateIcons(viewRoot);
  updateNavCount();
}

function navigate(view) {
  currentView = view;
  history.replaceState(null, '', `#${view}`);
  renderView();
  viewRoot.focus({ preventScroll: true });
}

function simulateIncident() {
  const samples = [
    { title: 'Search latency above SLO', service: 'Search API', summary: 'p95 latency reached 1.8s in the EU region.', facts: ['Impact: 23% of EU searches', 'Confidence: 93%', 'Estimated recovery: 6 minutes'] },
    { title: 'Webhook deliveries failing', service: 'Events gateway', summary: 'Partner webhooks are returning elevated 5xx responses.', facts: ['Impact: 62 queued events', 'Confidence: 91%', 'No payloads lost'] },
    { title: 'Storage capacity warning', service: 'Media pipeline', summary: 'Primary object storage crossed the 85% policy threshold.', facts: ['Impact: No customer impact yet', 'Confidence: 99%', '18 hours to projected limit'] }
  ];
  const sample = samples[Math.floor(Math.random() * samples.length)];
  const incident = {
    id: Date.now(), title: sample.title, service: sample.service, summary: sample.summary, facts: sample.facts,
    severity: 'critical', state: 'action', priority: 'P1', createdAt: Date.now(), stage: 3, messages: [], outcome: null,
    recommendation: `I correlated the alert with the most recent service change. I can apply the verified mitigation now. Proceed?`
  };
  state.incidents.unshift(incident);
  state.metrics.notifications += enabledChannels().length;
  selectedIncidentId = incident.id;
  inboxFilter = 'all';
  inboxQuery = '';
  dispatch('incident-created', incident);
  saveState();
  navigate('inbox');
  toast(`${incident.service} workflow delivered across ${enabledChannels().length} channels`, 'bell');
}

function resolveIncident(action) {
  const incident = state.incidents.find((item) => item.id === selectedIncidentId);
  if (!incident) return;
  if (action === 'approve') {
    incident.state = 'resolved'; incident.severity = 'resolved'; incident.priority = 'Resolved'; incident.stage = 4;
    incident.outcome = 'Approved by Maya. The action completed and every active channel was updated in place.';
    incident.summary = 'Mitigation approved; service health is returning to normal.';
    dispatch('incident-resolved', incident);
    toast('Action approved — channels synchronized', 'check');
  } else if (action === 'reject') {
    incident.state = 'resolved'; incident.severity = 'resolved'; incident.priority = 'Closed'; incident.stage = 4;
    incident.outcome = 'Rejected by Maya. Atlas preserved the incident context and took no external action.';
    dispatch('incident-rejected', incident);
    toast('Action rejected — no changes made', 'x');
  } else {
    incident.state = 'snoozed'; incident.priority = 'Snoozed'; incident.outcome = 'Snoozed for 30 minutes. Critical deterioration will bypass the snooze.';
    dispatch('incident-snoozed', incident);
    toast('Incident snoozed for 30 minutes', 'clock');
  }
  saveState();
  renderView();
}

function handleAgentMessage(form) {
  const incident = state.incidents.find((item) => item.id === selectedIncidentId);
  const textarea = form.querySelector('textarea');
  const text = textarea.value.trim();
  if (!incident || !text) return;
  incident.messages.push({ role: 'user', text });
  dispatch('agent-message', incident);
  saveState();
  renderView();
  const thread = document.getElementById('agent-thread');
  thread.insertAdjacentHTML('beforeend', `<div class="message" id="thinking-message"><span class="agent-avatar">${svgIcon('bot')}</span><div class="message-bubble agent-thinking" aria-label="Atlas is thinking"><span></span><span></span><span></span></div></div>`);
  thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
  window.setTimeout(() => {
    incident.messages.push({ role: 'agent', text: agentReplyFor(text, incident) });
    saveState();
    renderView();
    const updatedThread = document.getElementById('agent-thread');
    updatedThread?.scrollTo({ top: updatedThread.scrollHeight, behavior: 'smooth' });
  }, 650);
}

function openSettings() {
  renderSettings();
  hydrateIcons(settingsDialog);
  settingsDialog.showModal();
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) navigate(viewButton.dataset.view);

  if (event.target.closest('#theme-toggle')) setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  if (event.target.closest('#create-incident') || event.target.closest('[data-run-workflow]')) simulateIncident();
  if (event.target.closest('[data-go-inbox]')) navigate('inbox');
  if (event.target.closest('#open-settings') || event.target.closest('[data-open-settings]')) openSettings();

  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) { inboxFilter = filterButton.dataset.filter; renderInbox(); }

  const incidentButton = event.target.closest('[data-incident-id]');
  if (incidentButton) { selectedIncidentId = Number(incidentButton.dataset.incidentId); renderInbox(); document.querySelector('.incident-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  const actionButton = event.target.closest('[data-action]');
  if (actionButton) resolveIncident(actionButton.dataset.action);

  if (event.target.closest('[data-reset-demo]')) {
    state = seedState(); saveState(); settingsDialog.close(); renderView(); toast('Demo data restored', 'rotate');
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'incident-search') {
    inboxQuery = event.target.value;
    document.getElementById('incident-list').innerHTML = renderIncidentList();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches('[data-channel]')) {
    state.preferences.channels[event.target.dataset.channel] = event.target.checked;
    saveState();
    if (currentView === 'channels' && !settingsDialog.open) renderView();
    toast(`${event.target.dataset.channel === 'inbox' ? 'In-app Inbox' : event.target.dataset.channel} ${event.target.checked ? 'enabled' : 'disabled'}`, event.target.checked ? 'check' : 'x');
  }
  if (event.target.matches('[data-preference]')) {
    state.preferences[event.target.dataset.preference] = event.target.value;
    saveState();
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'agent-composer') {
    event.preventDefault();
    handleAgentMessage(event.target);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    if (currentView !== 'inbox') navigate('inbox');
    document.getElementById('incident-search')?.focus();
  }
});

const preferredTheme = localStorage.getItem('relay-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(preferredTheme);
hydrateIcons();
renderView();
fetch('/api/health').then((response) => response.json()).then((health) => setNovuMode(health.novu)).catch(() => setNovuMode('preview'));
