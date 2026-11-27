import { Locator, Page, expect } from '@playwright/test';
import { logger, step } from '../utils/logger';
import { getBaseUrl } from '../../config/environments';

export abstract class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = getBaseUrl();
  }

  abstract readonly path: string;

  async goto(pathOverride?: string): Promise<void> {
    const target = pathOverride ?? this.path;
    const url = target.startsWith('http') ? target : `${this.baseUrl}${target}`;
    step(`Navigate to ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }

  async dismissOverlays(): Promise<void> {
    // Cookie consent (Funding Choices)
    try {
      const consent = this.page.locator('.fc-cta-consent, button.fc-button.fc-cta-consent, .fc-consent-root button');
      if (await consent.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        await consent.first().click({ timeout: 2000 }).catch(() => undefined);
        logger.info('Dismissed cookie consent overlay');
      }
    } catch {
      // ignore
    }

    // Interstitial / Google ad iframes commonly inject a "Close" control
    const frameSelectors = [
      'iframe[id^="aswift"]',
      'iframe[id^="google_ads_iframe"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="ad.doubleclick"]',
    ];
    for (const sel of frameSelectors) {
      try {
        const frames = this.page.locator(sel);
        const count = await frames.count();
        for (let i = 0; i < count; i++) {
          const frame = this.page.frameLocator(sel).nth(i);
          const closeBtn = frame.locator(
            '#dismiss-button, .close-button, #close, button:has-text("Close"), a:has-text("Close"), [aria-label="Close"]',
          );
          if (await closeBtn.first().isVisible({ timeout: 400 }).catch(() => false)) {
            await closeBtn.first().click({ timeout: 1000 }).catch(() => undefined);
            logger.info(`Dismissed ad close control in ${sel}`);
          }
        }
      } catch {
        // ignore per-frame failures
      }
    }

    // Last resort: remove known ad containers so they cannot intercept clicks
    await this.page.evaluate(() => {
      const selectors = [
        'iframe[id^="aswift"]',
        'iframe[id^="google_ads_iframe"]',
        '#ad_iframe',
        'ins.adsbygoogle',
        '.adsbygoogle',
      ];
      for (const s of selectors) {
        document.querySelectorAll(s).forEach((el) => {
          const parent = el.parentElement;
          el.remove();
          if (parent && parent.id && parent.id.startsWith('aswift')) parent.remove();
        });
      }
      // Clear full-page overlay blockers left behind by ad hosts
      document.querySelectorAll('div[style*="z-index"]').forEach((el) => {
        const style = (el as HTMLElement).style;
        if (style && style.position === 'fixed' && Number(style.zIndex) > 100000) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    }).catch(() => undefined);
  }

  async clickSafe(locator: Locator, description: string): Promise<void> {
    step(`Click: ${description}`);
    await this.dismissOverlays();
    await locator.waitFor({ state: 'visible' });
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    try {
      await locator.click({ timeout: 5_000 });
    } catch {
      logger.warn(`Normal click failed for "${description}" — retrying after overlay dismiss + force`);
      await this.dismissOverlays();
      await locator.click({ force: true, timeout: 5_000 });
    }
  }

  async fillSafe(locator: Locator, value: string, description: string): Promise<void> {
    step(`Fill ${description}`);
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return ((await locator.textContent()) || '').trim();
  }

  loggedInAs(): Locator {
    return this.page.locator('a', { hasText: 'Logged in as' });
  }

  async expectLoggedIn(name?: string): Promise<void> {
    const banner = this.loggedInAs();
    await expect(banner).toBeVisible({ timeout: 15_000 });
    if (name) await expect(banner).toContainText(name);
  }

  async clickNav(linkText: string): Promise<void> {
    await this.clickSafe(this.page.locator(`.nav a:has-text("${linkText}")`).first(), `Nav → ${linkText}`);
  }

  async logout(): Promise<void> {
    await this.clickNav('Logout');
  }

  async deleteAccount(): Promise<void> {
    await this.dismissOverlays();
    const deleteLink = this.page.locator('a[href="/delete_account"], a:has-text("Delete Account")').first();
    try {
      await this.clickSafe(deleteLink, 'Delete Account');
    } catch {
      await this.page.goto(`${this.baseUrl}/delete_account`, { waitUntil: 'domcontentloaded' });
    }
    await this.dismissOverlays();
    await expect(this.page.locator('[data-qa="account-deleted"]')).toBeVisible({ timeout: 15_000 });
    await this.clickSafe(this.page.locator('[data-qa="continue-button"]'), 'Continue after delete');
  }
}
