import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { assertion, step } from '../utils/logger';

export class SignupLoginPage extends BasePage {
  readonly path = '/login';

  constructor(page: Page) {
    super(page);
  }

  private get signupName() { return this.page.locator('[data-qa="signup-name"]'); }
  private get signupEmail() { return this.page.locator('[data-qa="signup-email"]'); }
  private get signupButton() { return this.page.locator('[data-qa="signup-button"]'); }
  private get loginEmail() { return this.page.locator('[data-qa="login-email"]'); }
  private get loginPassword() { return this.page.locator('[data-qa="login-password"]'); }
  private get loginButton() { return this.page.locator('[data-qa="login-button"]'); }

  async open(): Promise<void> {
    await this.goto();
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    assertion('Signup/Login page is loaded');
    await this.dismissOverlays();
    await expect(this.loginEmail).toBeVisible({ timeout: 15_000 });
    await expect(this.signupName).toBeVisible({ timeout: 15_000 });
  }

  async startSignup(name: string, email: string): Promise<void> {
    step(`Start signup for ${email}`);
    await this.fillSafe(this.signupName, name, 'signup name');
    await this.fillSafe(this.signupEmail, email, 'signup email');
    await this.clickSafe(this.signupButton, 'Signup');
  }

  async login(email: string, password: string): Promise<void> {
    step(`Login as ${email}`);
    await this.fillSafe(this.loginEmail, email, 'login email');
    await this.fillSafe(this.loginPassword, password, 'login password');
    await this.clickSafe(this.loginButton, 'Login');
  }

  async expectSignupEmailExistsError(): Promise<void> {
    assertion('Duplicate email signup error is shown');
    await expect(this.page.locator('.signup-form p', { hasText: /Email Address already exist/i })).toBeVisible({ timeout: 10_000 });
  }

  async expectInvalidLoginError(): Promise<void> {
    assertion('Invalid login credentials error is shown');
    await expect(this.page.locator('.login-form p', { hasText: /Your email or password is incorrect/i })).toBeVisible({ timeout: 10_000 });
  }

  async expectStillOnLoginPage(): Promise<void> {
    assertion('User remains on login/signup page (not authenticated)');
    // Ads occasionally rewrite the URL; assert the login form is present instead.
    await expect(this.loginEmail).toBeVisible({ timeout: 10_000 });
    await expect(this.loginButton).toBeVisible();
    await expect(this.page.locator('a', { hasText: 'Logged in as' })).toHaveCount(0);
  }
}
