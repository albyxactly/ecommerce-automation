import { test, expect } from '../../src/fixtures/testFixtures';
import {
  registerNewUser,
  searchAndAddToCart,
  checkoutWithFakePayment,
} from '../../src/helpers/flows';
import { productsData, usersData } from '../../src/utils/testData';
import { step, assertion } from '../../src/utils/logger';

/**
 * Happy path: Sign Up → Login (session) → Search → Select → Add to Cart →
 * Cart Validation → Checkout with fake payment UI (no real money).
 */
test.describe('E-commerce happy path journey @happy', () => {
  test.describe.configure({ mode: 'serial' });

  test('Sign up, search product, add to cart, validate cart, and checkout with fake payment', async ({
    page,
    homePage,
    cartPage,
    signupLoginPage,
  }) => {
    // --- Sign Up ---
    const user = await registerNewUser(page);
    assertion(`Signed up and logged in as ${user.email}`);

    // --- Explicit Login cycle (logout then login) to cover Login step ---
    step('Logout then login to validate authentication persistence');
    await homePage.logout();
    await signupLoginPage.dismissOverlays();
    await expect(page.locator('[data-qa="login-email"]')).toBeVisible({ timeout: 15_000 });
    await signupLoginPage.login(user.email, user.password);
    await homePage.expectLoggedIn(user.name);

    // --- Search → Select → Add to Cart ---
    const productName = await searchAndAddToCart(
      page,
      productsData.validSearch.keyword,
      productsData.validSearch.expectedPartialName!,
      1,
    );

    // --- Cart Validation ---
    await cartPage.expectLoaded();
    await cartPage.expectProductInCart(productName);
    await cartPage.expectItemCount(1);
    await cartPage.expectQuantity(productName, 1);

    // --- Checkout (fake payment UI only) ---
    await checkoutWithFakePayment(
      page,
      productName,
      usersData.fakePayment,
      user.address1,
    );

    // Cleanup: delete account so we don't pollute the demo DB excessively
    step('Cleanup — delete test account');
    await homePage.goto('/');
    await homePage.dismissOverlays();
    await homePage.deleteAccount();
    await expect(page.locator('a[href="/login"], a:has-text("Signup / Login")').first()).toBeVisible();
  });
});
