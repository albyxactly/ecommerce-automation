import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { assertion, step } from '../utils/logger';

export class CartPage extends BasePage {
  readonly path = '/view_cart';

  constructor(page: Page) {
    super(page);
  }

  private get cartTable(): Locator {
    return this.page.locator('#cart_info_table, .cart_info table').first();
  }

  private get cartRows(): Locator {
    return this.page.locator('#cart_info_table tbody tr, .cart_info tbody tr');
  }

  async open(): Promise<void> {
    await this.goto();
    await this.dismissOverlays();
  }

  async expectLoaded(): Promise<void> {
    assertion('Cart page is loaded');
    await expect(this.page).toHaveURL(/view_cart/);
  }

  async expectProductInCart(productName: string): Promise<void> {
    assertion(`Cart contains product "${productName}"`);
    await expect(this.cartTable).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('.cart_description', { hasText: productName }).first()).toBeVisible();
  }

  async expectQuantity(productName: string, quantity: number | string): Promise<void> {
    assertion(`Cart quantity for "${productName}" is ${quantity}`);
    const row = this.page.locator('#cart_info_table tbody tr', { hasText: productName }).first();
    await expect(row.locator('.cart_quantity button').first()).toHaveText(String(quantity));
  }

  async getItemCount(): Promise<number> {
    // Empty cart may still render a table without product rows
    const rows = this.page.locator('#cart_info_table tbody tr[id^="product-"]');
    return rows.count();
  }

  async expectItemCount(count: number): Promise<void> {
    assertion(`Cart has ${count} item(s)`);
    await expect.poll(async () => this.getItemCount()).toBe(count);
  }

  async removeProduct(productName: string): Promise<void> {
    step(`Remove "${productName}" from cart`);
    const row = this.page.locator('#cart_info_table tbody tr', { hasText: productName }).first();
    await this.clickSafe(row.locator('a.cart_quantity_delete, .cart_delete a').first(), `Delete ${productName}`);
    await expect(row).toBeHidden({ timeout: 10_000 });
  }

  async proceedToCheckout(): Promise<void> {
    step('Proceed to checkout');
    await this.clickSafe(this.page.locator('a.check_out').first(), 'Proceed To Checkout');
  }

  async expectEmptyCart(): Promise<void> {
    assertion('Cart is empty');
    const count = await this.getItemCount();
    expect(count).toBe(0);
  }

  async getProductNames(): Promise<string[]> {
    const names = this.page.locator('#cart_info_table .cart_description h4 a, .cart_description a');
    const count = await names.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(((await names.nth(i).textContent()) || '').trim());
    }
    return result;
  }
}
