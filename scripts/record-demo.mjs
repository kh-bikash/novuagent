import { spawn } from 'node:child_process';
import { access, copyFile, mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';

const port = Number(process.env.PORT || 4173);
const host = '127.0.0.1';
const relayUrl = `http://${host}:${port}/#overview`;
const outputPath = resolve(process.env.DEMO_OUTPUT || 'videos/relay-real-workflow-demo.mp4');
const artifactDir = 'C:\\Users\\khbik\\.gemini\\antigravity-ide\\brain\\571d5b34-f400-4c12-9507-dbb86f267765';
const artifactPath = resolve(artifactDir, 'relay-real-workflow-demo.mp4');
const capturePath = outputPath.replace(/\.mp4$/i, '.capture.webm');

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
      await access(path);
      return path;
    } catch {}
  }
  throw new Error('Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable.');
}

async function isServerRunning() {
  try {
    const response = await fetch(`http://${host}:${port}/api/health`, { signal: AbortSignal.timeout(1200) });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isServerRunning()) {
    console.log(`Server already running on http://${host}:${port}`);
    return null;
  }
  console.log(`Starting local server on http://${host}:${port}...`);
  const serverProcess = spawn('node', ['server.mjs'], {
    cwd: resolve('.'),
    env: { ...process.env, PORT: String(port), HOST: host },
    stdio: 'inherit'
  });

  for (let i = 0; i < 30; i++) {
    await wait(400);
    if (await isServerRunning()) {
      console.log('Server started successfully.');
      return serverProcess;
    }
  }
  throw new Error('Failed to start local server within 12 seconds.');
}

async function transcodeTo60FpsMp4(input, output) {
  console.log('Transcoding recording to 60fps high-bitrate H.264 MP4 with hyperframes...');
  await new Promise((resolveProcess, rejectProcess) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-y',
      '-i', input,
      '-an',
      '-r', '60',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '16',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      output
    ], { stdio: ['ignore', 'inherit', 'inherit'] });
    ffmpeg.once('error', rejectProcess);
    ffmpeg.once('exit', (code) => (code === 0 ? resolveProcess() : rejectProcess(new Error(`ffmpeg exited with code ${code}`))));
  });
}

const serverProcess = await ensureServer();
const executablePath = await firstAvailable(chromeCandidates);
await mkdir(resolve('videos'), { recursive: true });

console.log(`Launching browser: ${executablePath}`);
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1 },
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--font-render-hinting=none',
    '--disable-gpu-vsync',
    '--force-device-scale-factor=1',
    '--autoplay-policy=no-user-gesture-required'
  ]
});

try {
  const page = await browser.newPage();
  await page.goto(relayUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.removeItem('relay-product-v1');
    localStorage.setItem('relay-theme', 'light');
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Injected Minimalist YouTube Subtitle Engine, Realistic Physics Cursor, Focus Zoom
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
    localStorage.setItem('relay-theme', 'light');

    const style = document.createElement('style');
    style.textContent = `
      html, body { overflow: hidden !important; }
      .app-shell {
        transform-origin: var(--demo-origin-x, 50%) var(--demo-origin-y, 50%);
        transition: transform 460ms cubic-bezier(0.16, 1, 0.3, 1), filter 350ms ease;
      }
      .app-shell.demo-focus {
        transform: scale(var(--demo-scale, 1.07));
      }
      .demo-target {
        position: relative;
        z-index: 8 !important;
        box-shadow: 0 0 0 3px #7057ff, 0 0 24px rgba(112, 87, 255, 0.32) !important;
        border-radius: inherit;
        transition: box-shadow 250ms ease;
      }

      /* Realistic Cursor */
      #demo-cursor {
        position: fixed;
        z-index: 99999;
        left: 0;
        top: 0;
        width: 26px;
        height: 30px;
        pointer-events: none;
        transform: translate3d(-50px, -50px, 0);
        transition: transform 460ms cubic-bezier(0.22, 0.85, 0.24, 1);
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
      }
      #demo-cursor svg {
        display: block;
        width: 24px;
        height: 28px;
      }
      #demo-cursor::after {
        content: '';
        position: absolute;
        left: 2px;
        top: 2px;
        width: 20px;
        height: 20px;
        border: 2px solid #7057ff;
        border-radius: 50%;
        opacity: 0;
        transform: scale(0.2);
      }
      #demo-cursor.is-clicking::after {
        animation: demo-click 480ms cubic-bezier(0.1, 0.8, 0.2, 1);
      }
      @keyframes demo-click {
        0% { opacity: 0.95; transform: scale(0.2); border-color: #7057ff; }
        100% { opacity: 0; transform: scale(2.4); border-color: #9f8cff; }
      }

      /* YouTube-Style Minimalist Captions Box */
      #yt-caption-container {
        position: fixed;
        z-index: 99998;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: none;
        display: flex;
        justify-content: center;
        width: auto;
        max-width: 88vw;
      }
      #yt-caption-box {
        background: rgba(12, 12, 15, 0.88);
        backdrop-filter: blur(14px);
        color: #ffffff;
        padding: 8px 18px;
        border-radius: 7px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14.5px;
        font-weight: 500;
        line-height: 1.45;
        letter-spacing: 0.012em;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08);
        transition: opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 1;
        transform: translateY(0);
      }
      #yt-caption-box.hidden {
        opacity: 0;
        transform: translateY(6px);
      }
      #yt-caption-box .hl-yellow {
        color: #fde047;
        font-weight: 600;
      }
      #yt-caption-box .hl-blue {
        color: #93c5fd;
        font-weight: 600;
      }
      #yt-caption-box .hl-green {
        color: #86efac;
        font-weight: 600;
      }
      #yt-caption-box .hl-purple {
        color: #c4b5fd;
        font-weight: 600;
      }
    `;
    document.head.append(style);

    // Cursor
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = '<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M2 1.5v21.2l5.8-5.2 4.1 8.7 4.2-2-4.1-8.4 8-.8L2 1.5Z" fill="#ffffff" stroke="#111113" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    document.body.append(cursor);

    // Subtitle Container
    const captionContainer = document.createElement('div');
    captionContainer.id = 'yt-caption-container';
    captionContainer.innerHTML = '<div id="yt-caption-box">Monitoring live service health and active incident workflows on the command center.</div>';
    document.body.append(captionContainer);
  });

  async function subtitle(htmlText, waitMs = 0) {
    await page.evaluate((text) => {
      const box = document.getElementById('yt-caption-box');
      box.classList.add('hidden');
      setTimeout(() => {
        box.innerHTML = text;
        box.classList.remove('hidden');
      }, 140);
    }, htmlText);
    if (waitMs > 0) await wait(waitMs);
  }

  async function targetBox(selector) {
    await page.waitForSelector(selector, { visible: true, timeout: 6000 });
    let element = await page.$(selector);
    let box = await element.boundingBox();
    if (box && (box.y < 0 || box.y + box.height > 900)) {
      await page.$eval(selector, (node) => node.scrollIntoView({ block: 'center', inline: 'center' }));
      await wait(300);
      element = await page.$(selector);
      box = await element.boundingBox();
    }
    if (!box) throw new Error(`Target not visible: ${selector}`);
    return { element, box, x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  async function moveTo(selector, ms = 550) {
    const target = await targetBox(selector);
    await page.evaluate(({ x, y }) => {
      document.getElementById('demo-cursor').style.transform = `translate3d(${x - 3}px, ${y - 2}px, 0)`;
    }, target);
    await page.mouse.move(target.x, target.y, { steps: 22 });
    await wait(ms);
    return target;
  }

  async function focus(selector, ms = 650, scale = 1.065) {
    const target = await targetBox(selector);
    await page.evaluate(({ selectorValue, x, y, scaleValue }) => {
      document.querySelectorAll('.demo-target').forEach((el) => el.classList.remove('demo-target'));
      const el = document.querySelector(selectorValue);
      el?.classList.add('demo-target');
      const shell = document.querySelector('.app-shell');
      shell.style.setProperty('--demo-origin-x', `${x}px`);
      shell.style.setProperty('--demo-origin-y', `${y}px`);
      shell.style.setProperty('--demo-scale', String(scaleValue));
      shell.classList.add('demo-focus');
    }, { selectorValue: selector, x: target.x, y: target.y, scaleValue: scale });
    await wait(ms);
  }

  async function unfocus(ms = 400) {
    await page.evaluate(() => {
      document.querySelector('.app-shell')?.classList.remove('demo-focus');
      document.querySelectorAll('.demo-target').forEach((el) => el.classList.remove('demo-target'));
    });
    await wait(ms);
  }

  async function click(selector, { pause = 500, zoom = true, scale = 1.055 } = {}) {
    const target = await moveTo(selector);
    await page.evaluate(() => document.getElementById('demo-cursor').classList.add('is-clicking'));
    await page.mouse.click(target.x, target.y);
    await wait(130);
    await page.evaluate(() => document.getElementById('demo-cursor').classList.remove('is-clicking'));
    if (zoom) {
      await focus(selector, 450, scale).catch(() => {});
      await unfocus(380);
    }
    await wait(pause);
  }

  async function realType(selector, text, { delay = 65 } = {}) {
    const target = await targetBox(selector);
    await moveTo(selector, 280);
    await page.mouse.click(target.x, target.y);
    await focus(selector, 320, 1.065);
    for (const char of text) {
      await page.keyboard.type(char);
      const jitter = Math.floor(Math.random() * 26) - 13;
      await wait(Math.max(25, delay + jitter));
    }
    await wait(500);
    await unfocus(350);
  }

  console.log('Starting 60fps hyperframe recording...');
  const recorder = await page.screencast({
    path: capturePath,
    format: 'webm',
    fps: 60,
    quality: 16,
    ffmpegPath
  });

  // ================= 1. OVERVIEW & TELEMETRY =================
  console.log('1. Overview Telemetry');
  await subtitle('Welcome to <span class="hl-purple">Relay</span> — an AI incident concierge powered by Novu.', 2800);
  await subtitle('Monitoring live production SLOs, active incidents, and multi-channel metrics.', 2600);

  await moveTo('.stat-card:first-child');
  await focus('.stat-card:first-child', 1200, 1.05);
  await unfocus(350);

  // ================= 2. SIMULATE CRITICAL PRODUCTION INCIDENT =================
  console.log('2. Simulate Incident');
  await subtitle('A production alert triggers: <span class="hl-yellow">Payments API checkout failures spike to 12%</span>.', 1500);
  await click('#create-incident', { pause: 1800, scale: 1.07 });

  // ================= 3. INBOX & MULTI-CHANNEL DISPATCH =================
  console.log('3. Inbox & Multi-Channel Dispatch');
  await subtitle('<span class="hl-blue">Novu Notify</span> routes synchronized alerts to In-App Inbox, Slack, and Email fallback.', 1800);
  await click('.sidebar button[data-view="inbox"]', { pause: 1200 });

  // Real user: searches in search bar
  await subtitle('Real-time search & filtering allows instant incident isolation.', 1200);
  await realType('#incident-search', 'checkout', { delay: 65 });
  await wait(800);

  // Clear search
  await page.evaluate(() => {
    const input = document.getElementById('incident-search');
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await wait(600);

  // User filters by 'Action needed'
  await click('.segmented button[data-filter="action"]', { pause: 900 });
  await click('.segmented button[data-filter="all"]', { pause: 800 });

  // Select the critical incident
  await subtitle('Opening the critical incident to investigate with <span class="hl-purple">Atlas AI Concierge</span>.', 1200);
  await click('.incident-item:first-child', { pause: 1600, scale: 1.05 });

  // Focus on workflow track
  await focus('.incident-detail .workflow-track', 1600, 1.06);
  await unfocus(350);

  // ================= 4. AI INVESTIGATION & INTERACTIVE CHAT =================
  console.log('4. Interactive Two-Way Agent Dialogue');
  await subtitle('Atlas analyzed <span class="hl-yellow">deploy #8421</span> and identified connection pool exhaustion.', 2200);

  await subtitle('Asking Atlas: <span class="hl-yellow">"What is the customer impact right now?"</span>', 1000);
  await realType('#agent-question', 'What is the customer impact right now?', { delay: 65 });
  await click('#agent-composer button[type="submit"]', { pause: 2400, scale: 1.06 });

  await subtitle('Atlas confirms: <span class="hl-yellow">184 failed checkouts, zero data loss</span>, safe to retry.', 2400);

  // Second question: Safety verification
  await subtitle('Verifying mitigation safety before taking action in production.', 1000);
  await realType('#agent-question', 'Is the mitigation safe to approve?', { delay: 68 });
  await click('#agent-composer button[type="submit"]', { pause: 2600, scale: 1.06 });

  await subtitle('Atlas verifies release #8420 is healthy and confirms low-risk rollback.', 2200);

  // ================= 5. ONE-CLICK HUMAN APPROVAL & STATE SYNC =================
  console.log('5. One-Click Human Approval');
  await subtitle('One-click human sign-off executes the rollback in production.', 1200);
  await click('[data-action="approve"]', { pause: 1400, scale: 1.08 });
  await page.waitForFunction(() => document.querySelector('.incident-detail .badge.positive')?.textContent.includes('Resolved'), { timeout: 6000 }).catch(() => {});

  await subtitle('<span class="hl-green">Incident Resolved!</span> Novu synchronizes the resolution across In-App, Slack & Email in place.', 2600);
  await focus('.detail-title', 1800, 1.06);
  await unfocus(450);

  // User checks another incident in the list
  await subtitle('Checking secondary warnings in the incident queue.', 1000);
  await click('.incident-item:nth-child(2)', { pause: 1500, scale: 1.04 });

  // ================= 6. WORKFLOW ARCHITECTURE =================
  console.log('6. Workflow Architecture');
  await subtitle('Inspecting <span class="hl-blue">Novu Workflow Pipelines</span> and multi-step notification DAGs.', 1800);
  await click('.sidebar button[data-view="workflows"]', { pause: 2200 });
  await focus('.workflow-card:first-child', 2000, 1.06);
  await unfocus(350);

  // ================= 7. CHANNELS & PREFERENCES =================
  console.log('7. Channels & Preferences');
  await subtitle('Configuring subscriber delivery channels and enabling <span class="hl-yellow">SMS escalation</span>.', 1600);
  await click('.sidebar button[data-view="channels"]', { pause: 2000 });
  await click('label.toggle:has(input[data-channel="sms"]) span', { pause: 1500, scale: 1.08 });

  // Open Preferences Modal
  await subtitle('Customizing notification quiet hours and real-time digest rules.', 1400);
  await click('#open-settings', { pause: 1600 });
  await focus('#settings-dialog', 1600, 1.04);
  await moveTo('#digest-mode');
  await page.select('#digest-mode', 'all-live');
  await wait(1000);
  await click('.dialog-actions .primary-button', { pause: 1500 });
  await unfocus(400);

  // ================= 8. RESOLVED OPERATIONS DASHBOARD =================
  console.log('8. Resolved Dashboard');
  await subtitle('All incidents resolved. Communication synchronized with zero manual overhead.', 3200);
  await click('.sidebar button[data-view="overview"]', { pause: 3800 });
  await wait(2000);

  // Stop recording
  console.log('Stopping 60fps screencast...');
  await recorder.stop();

  // Transcode to 60fps MP4
  await transcodeTo60FpsMp4(capturePath, outputPath);
  await unlink(capturePath).catch(() => {});

  // Copy to Artifact Directory
  await copyFile(outputPath, artifactPath).catch((err) => console.warn('Could not copy to artifact dir:', err.message));

  console.log(`\n========================================`);
  console.log(`60FPS Light-Mode Video recorded successfully!`);
  console.log(`Output: ${outputPath}`);
  console.log(`Artifact: ${artifactPath}`);
  console.log(`========================================\n`);
} finally {
  await browser.close();
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
}
