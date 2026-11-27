import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { getEnvironment } from './config/environments';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const env = getEnvironment();
const headless = process.env.HEADLESS !== 'false';
const workers = Number(process.env.WORKERS ?? 2);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: workers === 0 ? undefined : workers,
  timeout: env.timeouts.default * 2,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL: env.baseUrl,
    headless,
    launchOptions: { slowMo: Number(process.env.SLOW_MO || 0) },
    actionTimeout: env.timeouts.default,
    navigationTimeout: env.timeouts.navigation,
    screenshot: process.env.SCREENSHOT_ON_FAILURE !== 'false' ? 'only-on-failure' : 'off',
    video: process.env.VIDEO_ON_FAILURE !== 'false' ? 'retain-on-failure' : 'off',
    trace: process.env.TRACE_ON_RETRY !== 'false' ? 'on-first-retry' : 'off',
    viewport: { width: 1280, height: 720 },
  },
  outputDir: 'test-results',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
