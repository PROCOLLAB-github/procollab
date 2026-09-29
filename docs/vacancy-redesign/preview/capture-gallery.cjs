const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
    await page.goto('http://127.0.0.1:4359/gallery.html?capture');
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    await page.screenshot({ path: 'docs/vacancy-redesign/screenshots/overview.png', fullPage: true });
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
