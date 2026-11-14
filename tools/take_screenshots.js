const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'docs', 'screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function capture() {
  console.log('Launching browser via Edge executable...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Overview Screen
  console.log('Capturing 01_system_overview.png ...');
  await page.screenshot({ path: path.join(OUT_DIR, '01_system_overview.png'), fullPage: true });

  const tabs = [
    { name: '02_source_ip_analytics.png', text: 'Source IP Analytics' },
    { name: '03_destination_ip_analytics.png', text: 'Destination IP Analytics' },
    { name: '04_port_intelligence.png', text: 'Port Intelligence' },
    { name: '05_protocol_analytics.png', text: 'Protocol Analytics' },
    { name: '06_traffic_volume_tiers.png', text: 'Traffic Volume Tiers' },
    { name: '07_temporal_distribution.png', text: 'Temporal Distribution' },
    { name: '08_daily_comparative.png', text: 'Daily Baseline vs Attacks' },
    { name: '09_attack_taxonomy.png', text: 'Attack Taxonomy' },
    { name: '10_host_correlation_channels.png', text: 'Host Correlation Channels' },
    { name: '11_suspicious_heuristics.png', text: 'Suspicious Behavior Heuristics' },
    { name: '12_mapreduce_provenance.png', text: 'Hadoop MapReduce Provenance' }
  ];

  for (const t of tabs) {
    try {
      console.log(`Clicking tab ${t.text} ...`);
      // Find button containing text
      const buttons = await page.$$('button');
      let clicked = false;
      for (const btn of buttons) {
        const textContent = await page.evaluate(el => el.textContent, btn);
        if (textContent.includes(t.text)) {
          await btn.click();
          clicked = true;
          break;
        }
      }
      if (clicked) {
        await new Promise(r => setTimeout(r, 1500));
        console.log(`Capturing ${t.name} ...`);
        await page.screenshot({ path: path.join(OUT_DIR, t.name), fullPage: true });
      }
    } catch (e) {
      console.error(`Error capturing ${t.name}:`, e.message);
    }
  }

  // Also capture Swagger API Docs at http://localhost:8000/docs
  try {
    console.log('Navigating to API Docs http://localhost:8000/docs ...');
    await page.goto('http://localhost:8000/docs', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    console.log('Capturing 13_fastapi_swagger_docs.png ...');
    await page.screenshot({ path: path.join(OUT_DIR, '13_fastapi_swagger_docs.png'), fullPage: true });
  } catch (e) {
    console.error('Error capturing Swagger docs:', e.message);
  }

  // Also capture HDFS NameNode Web UI at http://localhost:9870
  try {
    console.log('Navigating to HDFS UI http://localhost:9870 ...');
    await page.goto('http://localhost:9870', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    console.log('Capturing 14_hdfs_namenode_ui.png ...');
    await page.screenshot({ path: path.join(OUT_DIR, '14_hdfs_namenode_ui.png'), fullPage: true });
  } catch (e) {
    console.error('Error capturing HDFS UI:', e.message);
  }

  await browser.close();
  console.log('Finished capturing all full-screen screenshots!');
}

capture().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
