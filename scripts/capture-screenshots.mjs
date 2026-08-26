import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const port = 4173;
const host = '127.0.0.1';
const baseUrl = `http://${host}:${port}`;
const assetsDir = resolve('assets');

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function firstAvailable(paths) {
  for (const path of paths) {
    try {
      const fs = await import('node:fs/promises');
      await fs.access(path);
      return path;
    } catch {}
  }
  throw new Error('No Chromium executable found.');
}

async function run() {
  console.log('Starting in-process HTTP server...');
  await import('../server.mjs');
  await wait(500);

  const execPath = await firstAvailable(chromeCandidates);
  await mkdir(assetsDir, { recursive: true });

  console.log(`Launching browser: ${execPath}`);
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage();

  // Helper to switch view
  const switchView = async (viewName) => {
    await page.evaluate((view) => {
      // Find nav button with data-view
      const btn = document.querySelector(`.primary-nav button[data-view="${view}"]`);
      if (btn) btn.click();
    }, viewName);
    await wait(400);
  };

  const setTheme = async (theme) => {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
      localStorage.setItem('relay-theme', t);
      const toggle = document.getElementById('theme-toggle');
      if (toggle) {
        toggle.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} theme`);
      }
    }, theme);
    await wait(200);
  };

  // 1. Reset state to clean seed state in dark theme
  await page.goto(`${baseUrl}/#inbox`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.removeItem('relay-product-v1');
    localStorage.setItem('relay-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await setTheme('dark');
  await wait(500);

  // 1. Capture Flagship Incident Inbox (Dark Mode)
  console.log('Capturing: incident-inbox-dark.png');
  await switchView('inbox');
  await page.screenshot({ path: resolve(assetsDir, 'incident-inbox-dark.png'), type: 'png' });

  // 2. Capture Flagship Incident Inbox (Light Mode)
  console.log('Capturing: incident-inbox-light.png');
  await setTheme('light');
  await wait(300);
  await page.screenshot({ path: resolve(assetsDir, 'incident-inbox-light.png'), type: 'png' });
  await setTheme('dark'); // switch back to dark for remaining captures

  // 3. Capture Atlas AI Agent interactive inquiry & diagnostics
  console.log('Capturing: atlas-agent-chat.png');
  await page.type('#agent-question', 'What was changed in deploy #8421 and what is the estimated impact?');
  await wait(300);
  await page.click('#agent-composer button[type="submit"]');
  await wait(1200); // wait for Atlas agent thinking animation and reply
  await page.screenshot({ path: resolve(assetsDir, 'atlas-agent-chat.png'), type: 'png' });

  // 4. Capture Approved & Synchronized state
  console.log('Capturing: incident-resolved-state.png');
  await page.click('button[data-action="approve"]');
  await wait(800);
  await page.screenshot({ path: resolve(assetsDir, 'incident-resolved-state.png'), type: 'png' });

  // 5. Capture Command Center Overview Dashboard
  console.log('Capturing: overview-dashboard.png');
  await switchView('overview');
  await wait(500);
  await page.screenshot({ path: resolve(assetsDir, 'overview-dashboard.png'), type: 'png' });

  // 6. Capture Workflows View
  console.log('Capturing: workflows-engine.png');
  await switchView('workflows');
  await wait(500);
  await page.screenshot({ path: resolve(assetsDir, 'workflows-engine.png'), type: 'png' });

  // 7. Capture Channels View
  console.log('Capturing: delivery-channels.png');
  await switchView('channels');
  await wait(500);
  await page.screenshot({ path: resolve(assetsDir, 'delivery-channels.png'), type: 'png' });

  // 8. Capture Preferences Modal
  console.log('Capturing: preferences-modal.png');
  await page.click('#open-settings');
  await wait(500);
  await page.screenshot({ path: resolve(assetsDir, 'preferences-modal.png'), type: 'png' });

  console.log('All 8 high-resolution product photos successfully captured in assets/ !');
  await browser.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
