const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function captureScreenshots() {
  console.log('[*] Launching Edge browser via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Home Page / Executive Overview
  console.log('[1/5] Capturing Home Page (Executive Overview)...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '1_home_page_overview.png') });

  // Helper to click sidebar tab by text
  async function clickTab(text) {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const textContent = await page.evaluate(el => el.textContent, btn);
      if (textContent.includes(text)) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1500));
        return true;
      }
    }
    return false;
  }

  // 2. Hadoop & Big Data Analytics
  console.log('[2/5] Capturing Hadoop & Big Data Analytics...');
  await clickTab('2. Big Data Analytics');
  await page.screenshot({ path: path.join(OUT_DIR, '2_hadoop_bigdata_analytics.png') });

  // 3. Machine Learning Overview & Models
  console.log('[3/5] Capturing Machine Learning & Models...');
  await clickTab('10. ML Overview');
  await page.screenshot({ path: path.join(OUT_DIR, '3_machine_learning_models.png') });

  // 4. Threat Intelligence & Risk Scoring
  console.log('[4/5] Capturing Threat Intelligence & Severity Tiers...');
  await clickTab('16. Threat Intelligence');
  await page.screenshot({ path: path.join(OUT_DIR, '4_threat_intelligence_operations.png') });

  await browser.close();
  console.log('[+] Browser screenshots captured successfully in output/ !');
}

captureScreenshots().catch(err => {
  console.error('[-] Error capturing screenshots:', err);
  process.exit(1);
});
