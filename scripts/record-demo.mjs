import { spawn } from 'node:child_process';
import { access, mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';

const relayUrl = process.env.RELAY_URL || 'http://127.0.0.1:4173/#overview';
const outputPath = resolve(process.env.DEMO_OUTPUT || 'videos/relay-real-workflow-demo.mp4');
const capturePath = outputPath.replace(/\.mp4$/i, '.capture.webm');
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

async function firstAvailable(paths) {
  for (const path of paths) {
    try {
      await access(path);
      return path;
    } catch {
      // Try the next browser supplied by the operating system.
    }
  }
  throw new Error('Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable.');
}

async function transcodeToMp4(input, output) {
  await new Promise((resolveProcess, rejectProcess) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-y', '-i', input, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output
    ], { stdio: ['ignore', 'inherit', 'inherit'] });
    ffmpeg.once('error', rejectProcess);
    ffmpeg.once('exit', (code) => code === 0 ? resolveProcess() : rejectProcess(new Error(`ffmpeg exited with code ${code}`)));
  });
}

const executablePath = await firstAvailable(chromeCandidates);
await mkdir(resolve('videos'), { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1 },
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
});

try {
  const page = await browser.newPage();
  await page.goto(relayUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.removeItem('relay-product-v1');
    localStorage.setItem('relay-theme', 'light');
  });
  await page.reload({ waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      html, body { overflow: hidden !important; }
      .app-shell { transform-origin: var(--demo-origin-x, 50%) var(--demo-origin-y, 50%); transition: transform 420ms cubic-bezier(.2,.8,.2,1), filter 300ms ease; }
      .app-shell.demo-focus { transform: scale(var(--demo-scale, 1.055)); }
      .demo-target { position: relative; z-index: 8 !important; box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent) !important; }
      #demo-cursor { position: fixed; z-index: 1000; left: 0; top: 0; width: 26px; height: 30px; pointer-events: none; transform: translate3d(-40px,-40px,0); transition: transform 520ms cubic-bezier(.22,.85,.24,1); filter: drop-shadow(0 2px 3px rgba(0,0,0,.34)); }
      #demo-cursor svg { display: block; width: 23px; height: 27px; }
      #demo-cursor::after { content: ''; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border: 2px solid #6d5dfc; border-radius: 50%; opacity: 0; transform: scale(.25); }
      #demo-cursor.is-clicking::after { animation: demo-click 520ms ease-out; }
      @keyframes demo-click { 0% { opacity: .95; transform: scale(.25); } 100% { opacity: 0; transform: scale(1.9); } }
    `;
    document.head.append(style);
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = '<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M2 1.5v21.2l5.8-5.2 4.1 8.7 4.2-2-4.1-8.4 8-.8L2 1.5Z" fill="#fff" stroke="#17171c" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.append(cursor);
  });

  async function targetBox(selector) {
    await page.waitForSelector(selector, { visible: true, timeout: 5000 });
    let element = await page.$(selector);
    let box = await element.boundingBox();
    if (box && (box.y < 0 || box.y + box.height > 900)) {
      await page.$eval(selector, (node) => node.scrollIntoView({ block: 'center', inline: 'center' }));
      await wait(500);
      element = await page.$(selector);
      box = await element.boundingBox();
    }
    if (!box) throw new Error(`Target is not visible: ${selector}`);
    return { element, box, x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  async function moveTo(selector, milliseconds = 760) {
    const target = await targetBox(selector);
    await page.evaluate(({ x, y }) => {
      document.getElementById('demo-cursor').style.transform = `translate3d(${x - 3}px, ${y - 2}px, 0)`;
    }, target);
    await page.mouse.move(target.x, target.y, { steps: 26 });
    await wait(milliseconds);
    return target;
  }

  async function focus(selector, milliseconds = 850, scale = 1.055) {
    const target = await targetBox(selector);
    await page.evaluate(({ selectorValue, x, y, scaleValue }) => {
      document.querySelectorAll('.demo-target').forEach((element) => element.classList.remove('demo-target'));
      const element = document.querySelector(selectorValue);
      element?.classList.add('demo-target');
      const shell = document.querySelector('.app-shell');
      shell.style.setProperty('--demo-origin-x', `${x}px`);
      shell.style.setProperty('--demo-origin-y', `${y}px`);
      shell.style.setProperty('--demo-scale', String(scaleValue));
      shell.classList.add('demo-focus');
    }, { selectorValue: selector, x: target.x, y: target.y, scaleValue: scale });
    await wait(milliseconds);
  }

  async function unfocus(milliseconds = 650) {
    await page.evaluate(() => {
      document.querySelector('.app-shell')?.classList.remove('demo-focus');
      document.querySelectorAll('.demo-target').forEach((element) => element.classList.remove('demo-target'));
    });
    await wait(milliseconds);
  }

  async function click(selector, { pause = 620, zoom = true } = {}) {
    const target = await moveTo(selector);
    await page.evaluate(() => document.getElementById('demo-cursor').classList.add('is-clicking'));
    await page.mouse.click(target.x, target.y);
    await wait(160);
    await page.evaluate(() => document.getElementById('demo-cursor').classList.remove('is-clicking'));
    if (zoom) {
      await focus(selector, 540, 1.05).catch(() => {});
      await unfocus(520);
    }
    await wait(pause);
  }

  const recorder = await page.screencast({
    path: capturePath,
    format: 'webm',
    fps: 30,
    quality: 20,
    ffmpegPath
  });

  await wait(2600);
  await click('.overview-hero button[data-run-workflow]', { pause: 1700 });
  await wait(1200);

  await moveTo('#agent-question');
  await page.mouse.click((await targetBox('#agent-question')).x, (await targetBox('#agent-question')).y);
  await focus('#agent-question', 520, 1.065);
  await page.type('#agent-question', 'What is the customer impact right now?', { delay: 88 });
  await wait(900);
  await unfocus(520);
  await click('#agent-composer button[type="submit"]', { pause: 2200 });

  await moveTo('#agent-question');
  const questionTarget = await targetBox('#agent-question');
  await page.mouse.click(questionTarget.x, questionTarget.y);
  await focus('#agent-question', 520, 1.065);
  await page.type('#agent-question', 'Is the mitigation safe to approve?', { delay: 92 });
  await wait(850);
  await unfocus(500);
  await click('#agent-composer button[type="submit"]', { pause: 2400 });

  await click('[data-action="approve"]', { pause: 900 });
  if (await page.$('[data-action="approve"]')) {
    const approveTarget = await moveTo('[data-action="approve"]', 420);
    await page.mouse.click(approveTarget.x, approveTarget.y);
  }
  await page.waitForFunction(() => document.querySelector('.incident-detail .badge.positive')?.textContent.includes('Resolved'), { timeout: 5000 });
  await wait(2600);
  await click('.sidebar button[data-view="workflows"]', { pause: 4200 });
  await click('.sidebar button[data-view="channels"]', { pause: 3000 });
  await click('label.toggle:has(input[data-channel="sms"]) span', { pause: 1900 });

  await click('#open-settings', { pause: 1700 });
  await moveTo('#digest-mode');
  await focus('#digest-mode', 420, 1.05);
  await page.select('#digest-mode', 'all-live');
  await wait(1300);
  await unfocus(500);
  await click('.dialog-actions .primary-button', { pause: 1500 });

  await click('.sidebar button[data-view="overview"]', { pause: 4800 });
  await recorder.stop();
  await transcodeToMp4(capturePath, outputPath);
  await unlink(capturePath);
  console.log(`Recorded real Relay workflow to ${outputPath}`);
} finally {
  await browser.close();
}
