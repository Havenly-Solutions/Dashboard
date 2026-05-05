const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'test_screenshot.png' });
  await browser.close();
})();
