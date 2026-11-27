import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { assertion, step } from '../utils/logger';

export class HomePage extends BasePage {
  readonly path = '/';

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto();
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    assertion('Home page is loaded');
    await this.dismissOverlays();
    await expect(this.page).toHaveTitle(/Automation Exercise/i);
    // Logged-out shows Signup/Login; logged-in shows Logged in as — either is a valid home shell.
    const authOrLogin = this.page
      .locator('a[href="/login"], a:has-text("Signup / Login"), a:has-text("Logged in as")')
      .first();
    await expect(authOrLogin).toBeVisible({ timeout: 15_000 });
  }

  async goToSignupLogin(): Promise<void> {
    step('Open Signup / Login');
    await this.clickSafe(this.page.locator('a[href="/login"]').first(), 'Signup / Login');
  }

  async goToProducts(): Promise<void> {
    step('Open Products');
    await this.clickSafe(this.page.locator('a[href="/products"]').first(), 'Products');
  }

  async goToCart(): Promise<void> {
    step('Open Cart');
    await this.clickSafe(this.page.locator('a[href="/view_cart"]').first(), 'Cart');
  }
}
