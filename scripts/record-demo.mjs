import { spawn } from 'node:child_process';
import { access, mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';

const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const url = 'http://' + host + ':' + port;
const output = resolve(process.env.DEMO_OUTPUT || 'videos/beacon-novu-workflow-demo.mp4');
const capture = output.replace(/\.mp4$/i, '.capture.webm');
const screenshot = resolve('assets/beacon-workflow.png');
const wait = ms => new Promise(resolveWait => setTimeout(resolveWait, ms));

const browsers = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

async function browserPath() {
  for (const candidate of browsers) {
    try { await access(candidate); return candidate; } catch {}
  }
  throw new Error('Chrome or Edge not found. Set CHROME_PATH.');
}

async function healthy() {
  try {
    const response = await fetch(url + '/api/health', { signal: AbortSignal.timeout(1200) });
    return response.ok;
  } catch { return false; }
}

async function server() {
  if (await healthy()) return null;
  const child = spawn('node', ['server.mjs'], {
    cwd: resolve('.'),
    env: { ...process.env, HOST: host, PORT: String(port) },
    stdio: 'inherit'
  });
  for (let index = 0; index < 30; index += 1) {
    await wait(350);
    if (await healthy()) return child;
  }
  throw new Error('Local server did not become ready.');
}

async function transcode() {
  await new Promise((done, fail) => {
    const child = spawn(ffmpegPath, [
      '-y', '-i', capture, '-an', '-r', '30',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output
    ], { stdio: ['ignore', 'inherit', 'inherit'] });
    child.once('error', fail);
    child.once('exit', code => code === 0 ? done() : fail(new Error('ffmpeg exited with ' + code)));
  });
}

const localServer = await server();
await mkdir(resolve('videos'), { recursive: true });
await mkdir(resolve('assets'), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: await browserPath(),
  headless: true,
  defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1 },
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars']
});

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = [
      'html,body{overflow:hidden!important}',
      '.shell{transform-origin:var(--focus-x,50%) var(--focus-y,50%);transition:transform 420ms cubic-bezier(.16,1,.3,1)}',
      '.shell.demo-focus{transform:scale(var(--focus-scale,1.065))}',
      '.demo-target{position:relative;z-index:8!important;box-shadow:0 0 0 3px rgba(107,87,232,.5),0 16px 45px rgba(60,45,155,.18)!important;transition:box-shadow .25s}',
      '#demo-cursor{position:fixed;z-index:99999;left:0;top:0;width:25px;height:29px;pointer-events:none;transform:translate3d(-50px,-50px,0);transition:transform 360ms cubic-bezier(.18,.8,.22,1);filter:drop-shadow(0 3px 4px rgba(0,0,0,.28))}',
      '#demo-cursor svg{width:25px;height:29px}',
      '#demo-cursor:after{content:"";position:absolute;left:1px;top:1px;width:20px;height:20px;border:2px solid #6b57e8;border-radius:50%;opacity:0;transform:scale(.2)}',
      '#demo-cursor.clicking:after{animation:click-ring .48s ease-out}',
      '@keyframes click-ring{0%{opacity:1;transform:scale(.2)}100%{opacity:0;transform:scale(2.5)}}',
      '#demo-caption{position:fixed;z-index:99998;left:50%;bottom:25px;transform:translateX(-50%);max-width:850px;padding:9px 17px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(15,17,15,.88);backdrop-filter:blur(12px);color:#fff;font:600 15px/1.4 Inter,Aptos,"Segoe UI",sans-serif;letter-spacing:.005em;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.24);transition:.18s}',
      '#demo-caption.hide{opacity:0;transform:translate(-50%,6px)}',
      '#demo-caption strong{color:#c8ff4d}'
    ].join('');
    document.head.append(style);
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = '<svg viewBox="0 0 24 28"><path d="M2 1.5v21.2l5.8-5.2 4.1 8.7 4.2-2-4.1-8.4 8-.8L2 1.5Z" fill="#fff" stroke="#151715" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    document.body.append(cursor);
    const caption = document.createElement('div');
    caption.id = 'demo-caption';
    caption.innerHTML = 'A critical event needs a fast decision — <strong>without notification noise.</strong>';
    document.body.append(caption);
  });

  async function caption(html, hold = 0) {
    await page.evaluate(text => {
      const box = document.querySelector('#demo-caption');
      box.classList.add('hide');
      setTimeout(() => { box.innerHTML = text; box.classList.remove('hide'); }, 150);
    }, html);
    if (hold) await wait(hold);
  }

  async function center(selector) {
    await page.waitForSelector(selector, { visible: true, timeout: 8000 });
    const handle = await page.$(selector);
    const box = await handle.boundingBox();
    if (!box) throw new Error('Invisible target: ' + selector);
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  async function move(selector, pause = 300) {
    const point = await center(selector);
    await page.evaluate(({ x, y }) => {
      document.querySelector('#demo-cursor').style.transform = 'translate3d(' + (x - 3) + 'px,' + (y - 2) + 'px,0)';
    }, point);
    await page.mouse.move(point.x, point.y, { steps: 20 });
    await wait(pause);
    return point;
  }

  async function focus(selector, scale = 1.065) {
    const point = await center(selector);
    await page.evaluate(({ selector, point, scale }) => {
      document.querySelectorAll('.demo-target').forEach(node => node.classList.remove('demo-target'));
      document.querySelector(selector)?.classList.add('demo-target');
      const shell = document.querySelector('.shell');
      shell.style.setProperty('--focus-x', point.x + 'px');
      shell.style.setProperty('--focus-y', point.y + 'px');
      shell.style.setProperty('--focus-scale', String(scale));
      shell.classList.add('demo-focus');
    }, { selector, point, scale });
    await wait(470);
  }

  async function unfocus() {
    await page.evaluate(() => {
      document.querySelector('.shell')?.classList.remove('demo-focus');
      document.querySelectorAll('.demo-target').forEach(node => node.classList.remove('demo-target'));
    });
    await wait(420);
  }

  async function click(selector, hold = 650, scale = 1.07) {
    await focus(selector, scale);
    const point = await move(selector, 180);
    await page.evaluate(() => document.querySelector('#demo-cursor').classList.add('clicking'));
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await wait(90);
    await page.mouse.up();
    await wait(120);
    await page.evaluate(() => document.querySelector('#demo-cursor').classList.remove('clicking'));
    await wait(hold);
    await unfocus();
  }

  async function type(selector, text) {
    await focus(selector, 1.08);
    const point = await move(selector, 180);
    await page.mouse.click(point.x, point.y);
    for (const character of text) {
      await page.keyboard.type(character);
      await wait(42 + Math.floor(Math.random() * 28));
    }
    await wait(850);
    await unfocus();
  }

  const recorder = await page.screencast({
    path: capture,
    format: 'webm',
    fps: 30,
    quality: 18,
    ffmpegPath
  });

  await wait(2600);
  await caption('Novu keeps <strong>routing, preferences, and channel timing</strong> out of product code.', 2500);
  await focus('.workflow-card', 1.045); await wait(1700); await unfocus();

  await caption('First, the on-call engineer controls <strong>where urgent decisions arrive.</strong>', 900);
  await click('#routing-btn', 800);
  await wait(2300);
  await click('#routing-dialog .close-btn', 500, 1.045);

  await caption('A real P1 event triggers the <strong>critical-incident</strong> workflow.', 900);
  await click('#trigger-btn', 500);
  await page.waitForFunction(() => document.querySelector('#workflow-state')?.textContent.includes('WAITING'), { timeout: 8000 });
  await caption('Inbox and Slack deliver immediately. <strong>Email waits as a fallback.</strong>', 2600);
  await focus('.workflow-line', 1.055); await wait(2100); await unfocus();

  await caption('The actionable notification reaches Maya with <strong>impact and recovery context.</strong>', 1800);
  await focus('.message:first-child', 1.075); await wait(2200); await unfocus();

  await caption('She adds a note before deciding — a natural, auditable workflow.', 900);
  await type('#note', 'Rollback safe? Confirm no schema change.');
  await click('#send-note', 500, 1.09);
  await page.waitForFunction(() => document.querySelectorAll('.message').length >= 3, { timeout: 6000 });
  await caption('The timeline now carries the human question and <strong>verified context.</strong>', 2200);
  await focus('.message:last-child', 1.07); await wait(1800); await unfocus();

  await caption('With the risk understood, Maya approves the rollback.', 1100);
  await click('#approve-btn', 500, 1.08);
  await page.waitForFunction(() => document.querySelector('#workflow-state')?.textContent === 'COMPLETED', { timeout: 8000 });
  await caption('Novu publishes the resolution to active channels and <strong>cancels unused escalation.</strong>', 2600);
  await focus('#outcome', 1.065); await wait(1800); await unfocus();
  await focus('#receipts', 1.07); await wait(1800); await unfocus();

  await caption('<strong>One event. One decision. Every channel in sync.</strong>', 3900);
  await page.evaluate(() => {
    document.querySelector('#demo-caption').style.display = 'none';
    document.querySelector('#demo-cursor').style.display = 'none';
    document.querySelectorAll('.demo-target').forEach(node => node.classList.remove('demo-target'));
  });
  await page.screenshot({ path: screenshot, type: 'png' });

  await recorder.stop();
  await transcode();
  await unlink(capture).catch(() => {});
  console.log('Demo written to ' + output);
  console.log('README screenshot written to ' + screenshot);
} finally {
  await browser.close();
  if (localServer) localServer.kill('SIGINT');
}
