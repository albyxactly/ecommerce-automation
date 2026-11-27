import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { assertion, step } from '../utils/logger';

export class ProductsPage extends BasePage {
  readonly path = '/products';

  constructor(page: Page) {
    super(page);
  }

  private get searchInput(): Locator { return this.page.locator('#search_product'); }
  private get searchButton(): Locator { return this.page.locator('#submit_search'); }
  private get productCards(): Locator { return this.page.locator('.features_items .product-image-wrapper'); }

  async open(): Promise<void> {
    await this.goto();
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    assertion('Products page is loaded');
    await expect(this.page.locator('.features_items')).toBeVisible({ timeout: 15_000 });
    await expect(this.searchInput).toBeVisible();
  }

  async search(keyword: string): Promise<void> {
    step(`Search products for "${keyword}"`);
    await this.fillSafe(this.searchInput, keyword, 'search keyword');
    await this.clickSafe(this.searchButton, 'Submit search');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectSearchResultsContain(partialName: string): Promise<void> {
    assertion(`Search results contain "${partialName}"`);
    await expect(this.page.locator('.features_items')).toBeVisible();
    await expect(this.page.locator('.productinfo p, .productinfo h2', { hasText: partialName }).first()).toBeVisible({ timeout: 10_000 });
  }

  async expectNoProductsFound(): Promise<void> {
    assertion('No products found for invalid search');
    expect(await this.productCards.count(), 'Expected zero product cards for invalid search').toBe(0);
  }

  async openProductByName(name: string): Promise<void> {
    step(`Open product details for "${name}"`);
    const card = this.page.locator('.product-image-wrapper', { hasText: name }).first();
    await this.clickSafe(card.locator('a[href*="/product_details/"]'), `View ${name}`);
  }
}
