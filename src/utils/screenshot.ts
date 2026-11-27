import { Page, TestInfo } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

const screenshotRoot = path.resolve(__dirname, '../../screenshots');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function captureScreenshot(
  page: Page,
  name: string,
  testInfo?: TestInfo,
): Promise<string> {
  ensureDir(screenshotRoot);
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileName = `${Date.now()}_${safeName}.png`;
  const filePath = path.join(screenshotRoot, fileName);

  try {
    await page.screenshot({ path: filePath, fullPage: true });
    logger.info(`Screenshot saved: ${filePath}`);
    if (testInfo) {
      await testInfo.attach(safeName, { path: filePath, contentType: 'image/png' });
    }
    return filePath;
  } catch (error) {
    logger.error(`Failed to capture screenshot "${name}": ${error}`);
    throw error;
  }
}

export async function captureOnFailure(page: Page, testInfo: TestInfo): Promise<void> {
  if (testInfo.status === testInfo.expectedStatus) return;
  try {
    await captureScreenshot(page, `FAILURE_${testInfo.title}`, testInfo);
  } catch (error) {
    logger.warn(`Could not capture failure screenshot: ${error}`);
  }
}
