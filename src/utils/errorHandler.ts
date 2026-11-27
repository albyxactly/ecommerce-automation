import { Page, TestInfo } from '@playwright/test';
import { logger } from './logger';
import { captureScreenshot } from './screenshot';

export class AutomationError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AutomationError';
  }
}

export async function withErrorHandling<T>(
  page: Page,
  stepName: string,
  action: () => Promise<T>,
  testInfo?: TestInfo,
): Promise<T> {
  logger.info(`START: ${stepName}`);
  try {
    const result = await action();
    logger.info(`DONE:  ${stepName}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`FAILED: ${stepName} — ${message}`);
    try {
      await captureScreenshot(page, `error_${stepName}`, testInfo);
    } catch {
      // best-effort
    }
    throw new AutomationError(`Step "${stepName}" failed: ${message}`, {
      step: stepName,
      original: message,
    });
  }
}
