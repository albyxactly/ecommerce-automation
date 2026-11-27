import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { FakePayment } from '../utils/testData';
import { assertion, step } from '../utils/logger';
import { getEnvironment } from '../../config/environments';

/**
 * Checkout + payment UI flows.
 * NOTE: This demo site accepts fake cards. We never treat this as a real purchase.
 * Payment submission is only for UI validation when features.useFakePayment is true.
 */
export class CheckoutPage extends BasePage {
  readonly path = '/checkout';

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    assertion('Checkout page is loaded');
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.page.locator('#address_delivery, .checkout-information').first()).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectAddressVisible(partial: string): Promise<void> {
    assertion(`Delivery address contains "${partial}"`);
    await expect(this.page.locator('#address_delivery')).toContainText(partial);
  }

  async expectReviewOrderContains(productName: string): Promise<void> {
    assertion(`Order review contains "${productName}"`);
    await expect(this.page.locator('#cart_info')).toContainText(productName);
  }

  async placeOrder(comment?: string): Promise<void> {
    step('Place order (navigate to payment form)');
    if (comment) {
      await this.fillSafe(this.page.locator('textarea[name="message"]'), comment, 'order comment');
    }
    await this.dismissOverlays();
    const placeOrder = this.page.locator('a[href="/payment"]').first();
    try {
      await this.clickSafe(placeOrder, 'Place Order');
      await this.page.waitForURL(/\/payment/, { timeout: 8_000 });
    } catch {
      // Ad iframes frequently intercept this click on the demo host — fall back to direct nav.
      step('Place Order click intercepted — navigating directly to /payment');
      await this.page.goto(`${this.baseUrl}/payment`, { waitUntil: 'domcontentloaded' });
    }
    await this.dismissOverlays();
  }

  async expectPaymentPage(): Promise<void> {
    assertion('Payment page is loaded');
    await this.dismissOverlays();
    await expect(this.page.locator('[data-qa="name-on-card"]')).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('[data-qa="pay-button"]')).toBeVisible();
  }

  /**
   * Fill fake card details for UI validation only.
   * Guards against accidental real purchase semantics via environment flags.
   */
  async fillFakePayment(payment: FakePayment): Promise<void> {
    const env = getEnvironment();
    if (!env.features.useFakePayment) {
      throw new Error('Fake payment is disabled for this environment');
    }
    if (env.features.allowPurchase) {
      throw new Error('Real purchase is not allowed in this automation suite');
    }

    step('Fill fake payment details (demo UI only — not a real purchase)');
    await this.fillSafe(this.page.locator('[data-qa="name-on-card"]'), payment.nameOnCard, 'name on card');
    await this.fillSafe(this.page.locator('[data-qa="card-number"]'), payment.cardNumber, 'card number');
    await this.fillSafe(this.page.locator('[data-qa="cvc"]'), payment.cvc, 'cvc');
    await this.fillSafe(this.page.locator('[data-qa="expiry-month"]'), payment.expiryMonth, 'expiry month');
    await this.fillSafe(this.page.locator('[data-qa="expiry-year"]'), payment.expiryYear, 'expiry year');
  }

  async submitPaymentForUiValidation(): Promise<void> {
    const env = getEnvironment();
    if (!env.features.useFakePayment || env.features.allowPurchase) {
      throw new Error('Payment submit blocked by environment policy');
    }
    step('Submit payment form for demo UI confirmation (not a real monetary purchase)');
    await this.clickSafe(this.page.locator('[data-qa="pay-button"]'), 'Pay and Confirm Order');
  }

  async expectOrderPlacedConfirmation(): Promise<void> {
    assertion('Order placed confirmation is shown (demo site)');
    await expect(
      this.page.locator('[data-qa="order-placed"], p', { hasText: /Congratulations.*order has been confirmed/i }).first(),
    ).toBeVisible({ timeout: 15_000 });
  }

  async expectRequiredFieldValidation(): Promise<void> {
    assertion('Payment required-field validation prevents empty submit');
    // HTML5 required attributes on payment inputs — stay on payment page
    await expect(this.page).toHaveURL(/\/payment/);
    await expect(this.page.locator('[data-qa="name-on-card"]')).toBeVisible();
  }

  async goBackToCart(): Promise<void> {
    step('Navigate back during checkout');
    await this.page.goBack();
  }
}
