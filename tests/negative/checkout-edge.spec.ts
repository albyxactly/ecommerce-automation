import { test, expect } from '../../src/fixtures/testFixtures';
import { registerNewUser, searchAndAddToCart } from '../../src/helpers/flows';
import { productsData, usersData } from '../../src/utils/testData';
import { assertion, step } from '../../src/utils/logger';

test.describe('Checkout edge scenarios @negative', () => {
  test('Payment form rejects empty required fields; back navigation preserves cart', async ({
    page,
    cartPage,
    checkoutPage,
    homePage,
  }) => {
    const user = await registerNewUser(page);

    const productName = await searchAndAddToCart(
      page,
      productsData.validSearch.keyword,
      productsData.validSearch.expectedPartialName!,
    );

    await cartPage.expectProductInCart(productName);
    await cartPage.proceedToCheckout();
    await checkoutPage.expectLoaded();
    await checkoutPage.expectReviewOrderContains(productName);
    await checkoutPage.expectAddressVisible(user.firstName);

    // Proceed to payment
    await checkoutPage.placeOrder('Edge-case checkout');
    await checkoutPage.expectPaymentPage();

    // Attempt submit without filling required fields
    step('Submit empty payment form — expect HTML5 validation to block');
    await page.locator('[data-qa="pay-button"]').click();
    await checkoutPage.expectRequiredFieldValidation();

    // Fill only partial fields and re-check we stay on payment
    await checkoutPage.fillSafe(
      page.locator('[data-qa="name-on-card"]'),
      usersData.fakePayment.nameOnCard,
      'name only',
    );
    await page.locator('[data-qa="pay-button"]').click();
    await expect(page).toHaveURL(/\/payment/);
    assertion('Incomplete payment details do not complete order');

    // Back / navigation during checkout should not wipe cart
    step('Navigate back during checkout and verify cart persistence');
    await checkoutPage.goBackToCart();
    // May land on checkout or cart depending on history; go to cart explicitly
    await cartPage.open();
    await cartPage.expectProductInCart(productName);
    await cartPage.expectItemCount(1);
    assertion('Cart retained after back/nav during checkout');

    // Cleanup
    await homePage.goto('/');
    await homePage.dismissOverlays();
    await homePage.deleteAccount();
  });

  test('Checkout requires login — guest redirected or prompted', async ({
    page,
    productsPage,
    productDetailPage,
    cartPage,
  }) => {
    // Guest adds to cart without logging in
    await productsPage.open();
    await productsPage.search(productsData.validSearch.keyword);
    await productsPage.expectSearchResultsContain(productsData.validSearch.expectedPartialName!);
    await productsPage.openProductByName(productsData.validSearch.expectedPartialName!);
    await productDetailPage.expectLoaded();
    await productDetailPage.addToCart();
    await productDetailPage.expectAddedModal();
    await productDetailPage.viewCartFromModal();

    await cartPage.expectLoaded();
    await cartPage.proceedToCheckout();

    // Site shows register/login modal for guests
    const checkoutModal = page.locator('#checkoutModal, .modal-content', {
      hasText: /Register|Login/i,
    }).first();
    await expect(checkoutModal).toBeVisible({ timeout: 10_000 });
    assertion('Guest checkout correctly prompts for Register / Login');
  });
});
