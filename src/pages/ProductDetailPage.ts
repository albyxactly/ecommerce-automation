import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { assertion, step } from '../utils/logger';

export class ProductDetailPage extends BasePage {
  readonly path = '/product_details/';

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    assertion('Product detail page is loaded');
    await expect(this.page).toHaveURL(/\/product_details\/\d+/);
    await expect(this.page.locator('.product-information')).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('button.cart').first()).toBeVisible();
  }

  async getProductName(): Promise<string> {
    return this.getText(this.page.locator('.product-information h2').first());
  }

  async setQuantity(qty: number): Promise<void> {
    step(`Set product quantity to ${qty}`);
    await this.page.locator('#quantity').fill(String(qty));
  }

  async addToCart(): Promise<void> {
    step('Add product to cart');
    await this.clickSafe(this.page.locator('button.cart').first(), 'Add to cart');
  }

  async expectAddedModal(): Promise<void> {
    assertion('Added to cart confirmation modal is shown');
    await expect(this.page.locator('#cartModal')).toBeVisible({ timeout: 10_000 });
    await expect(this.page.locator('#cartModal')).toContainText(/Added!/i);
  }

  async viewCartFromModal(): Promise<void> {
    step('View Cart from modal');
    await this.clickSafe(this.page.locator('#cartModal a[href="/view_cart"]').first(), 'View Cart');
  }

  async continueShoppingFromModal(): Promise<void> {
    step('Continue shopping from modal');
    await this.clickSafe(
      this.page.locator('#cartModal button.close-modal, #cartModal .btn-success').first(),
      'Continue Shopping',
    );
  }
}
