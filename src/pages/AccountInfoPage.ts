import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserProfile } from '../utils/testData';
import { assertion, step } from '../utils/logger';

export class AccountInfoPage extends BasePage {
  readonly path = '/signup';

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    assertion('Enter Account Information page is loaded');
    await expect(this.page.locator('.login-form h2.title, .login-form b').first()).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('[data-qa="password"]')).toBeVisible();
  }

  async fillAccountDetails(user: UserProfile): Promise<void> {
    step('Fill account information form');
    const titleRadio = user.title.toLowerCase() === 'mrs'
      ? this.page.locator('#id_gender2')
      : this.page.locator('#id_gender1');
    await titleRadio.check().catch(async () => { await titleRadio.click(); });

    await this.fillSafe(this.page.locator('[data-qa="password"]'), user.password, 'password');
    await this.page.locator('[data-qa="days"]').selectOption(user.day);
    await this.page.locator('[data-qa="months"]').selectOption(user.month);
    await this.page.locator('[data-qa="years"]').selectOption(user.year);
    await this.page.locator('#newsletter').check().catch(() => undefined);
    await this.page.locator('#optin').check().catch(() => undefined);

    await this.fillSafe(this.page.locator('[data-qa="first_name"]'), user.firstName, 'first name');
    await this.fillSafe(this.page.locator('[data-qa="last_name"]'), user.lastName, 'last name');
    await this.fillSafe(this.page.locator('[data-qa="company"]'), user.company, 'company');
    await this.fillSafe(this.page.locator('[data-qa="address"]'), user.address1, 'address1');
    await this.fillSafe(this.page.locator('[data-qa="address2"]'), user.address2, 'address2');
    await this.page.locator('[data-qa="country"]').selectOption(user.country);
    await this.fillSafe(this.page.locator('[data-qa="state"]'), user.state, 'state');
    await this.fillSafe(this.page.locator('[data-qa="city"]'), user.city, 'city');
    await this.fillSafe(this.page.locator('[data-qa="zipcode"]'), user.zipcode, 'zipcode');
    await this.fillSafe(this.page.locator('[data-qa="mobile_number"]'), user.mobile, 'mobile');
  }

  async submit(): Promise<void> {
    step('Submit Create Account');
    await this.clickSafe(this.page.locator('[data-qa="create-account"]'), 'Create Account');
  }

  async expectAccountCreated(): Promise<void> {
    assertion('Account Created confirmation is shown');
    await expect(this.page.locator('[data-qa="account-created"]')).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('[data-qa="account-created"]')).toContainText(/Account Created!/i);
  }

  async continueAfterCreate(): Promise<void> {
    await this.clickSafe(this.page.locator('[data-qa="continue-button"]'), 'Continue');
  }
}
