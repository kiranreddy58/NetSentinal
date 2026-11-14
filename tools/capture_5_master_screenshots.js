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

  // Helper to click sidebar or module button by text prefix/includes
  async function scrollToTab(text) {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const textContent = await page.evaluate(el => el.textContent, btn);
      if (textContent && textContent.includes(text)) {
        console.log(`    -> Clicked module: "${text}"`);
        await btn.click();
        await new Promise(r => setTimeout(r, 1500));
        return true;
      }
    }
    console.log(`    [-] Module not found: "${text}"`);
    return false;
  }

  // 2. Machine Learning Overview & Models
  console.log('[2/5] Capturing Machine Learning & Models...');
  await scrollToTab('Model Insights');
  await page.screenshot({ path: path.join(OUT_DIR, '3_machine_learning_models.png') });

  // 3. Hadoop & Big Data Analytics
  console.log('[3/5] Capturing Hadoop & Big Data Analytics...');
  await scrollToTab('Big Data Analytics');
  await page.screenshot({ path: path.join(OUT_DIR, '4_hadoop_bigdata_analytics.png') });

  // 4. Threat Intelligence & Severity Tiers
  console.log('[4/5] Capturing Threat Intelligence & Severity Tiers...');
  await scrollToTab('Threat Intelligence');
  await page.screenshot({ path: path.join(OUT_DIR, '5_threat_intelligence_operations.png') });

  // 5. Responsive Views
  console.log('[+] Capturing Tablet & Mobile responsive views...');
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'tablet_overview.png') });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_overview.png') });

  await browser.close();
  console.log('[+] All master screenshots updated successfully in output/ !');
}

captureScreenshots().catch(err => {
  console.error('[-] Error capturing screenshots:', err);
  process.exit(1);
});
