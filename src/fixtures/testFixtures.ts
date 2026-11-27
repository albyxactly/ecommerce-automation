import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SignupLoginPage } from '../pages/SignupLoginPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { captureOnFailure } from '../utils/screenshot';
import { logger } from '../utils/logger';
import { usersData, productsData } from '../utils/testData';

type Pages = {
  homePage: HomePage;
  signupLoginPage: SignupLoginPage;
  accountInfoPage: AccountInfoPage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  testUsers: typeof usersData;
  testProducts: typeof productsData;
};

/**
 * Custom Playwright fixtures providing Page Objects + shared test data.
 * Automatically captures screenshots on failure.
 */
export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  signupLoginPage: async ({ page }, use) => {
    await use(new SignupLoginPage(page));
  },
  accountInfoPage: async ({ page }, use) => {
    await use(new AccountInfoPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  testUsers: async ({}, use) => {
    await use(usersData);
  },
  testProducts: async ({}, use) => {
    await use(productsData);
  },
});

test.beforeEach(async ({}, testInfo) => {
  logger.info(`▶ START TEST: ${testInfo.title}`);
});

test.afterEach(async ({ page }, testInfo) => {
  await captureOnFailure(page, testInfo);
  const status = testInfo.status === testInfo.expectedStatus ? 'PASS' : 'FAIL';
  logger.info(`◀ END TEST [${status}]: ${testInfo.title}`);
});

export { expect };
