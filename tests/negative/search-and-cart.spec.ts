import { test, expect } from '../../src/fixtures/testFixtures';
import { registerNewUser, searchAndAddToCart } from '../../src/helpers/flows';
import { productsData } from '../../src/utils/testData';
import { assertion, step } from '../../src/utils/logger';

test.describe('Search and cart edge scenarios @negative', () => {
  test('Invalid product search returns no matching products', async ({
    productsPage,
    testProducts,
  }) => {
    await productsPage.open();
    await productsPage.search(testProducts.invalidSearch.keyword);
    await productsPage.expectNoProductsFound();
    assertion('Invalid search yields empty product list');
  });

  test('Cart remove item and quantity validation', async ({
    page,
    cartPage,
    productsPage,
    productDetailPage,
    homePage,
  }) => {
    const user = await registerNewUser(page);

    // Add a product
    const productName = await searchAndAddToCart(
      page,
      productsData.validSearch.keyword,
      productsData.validSearch.expectedPartialName!,
      productsData.cartQuantity.increaseTo,
    );

    await cartPage.expectProductInCart(productName);
    await cartPage.expectQuantity(productName, productsData.cartQuantity.increaseTo);

    // Remove the product
    await cartPage.removeProduct(productName);
    await cartPage.expectEmptyCart();
    assertion('Cart correctly reflects remove action');

    // Add alternate product and verify cart persistence across navigation
    step('Verify cart persistence after navigation');
    await productsPage.open();
    await productsPage.search(productsData.alternateSearch.keyword);
    await productsPage.expectSearchResultsContain(productsData.alternateSearch.expectedPartialName!);
    await productsPage.openProductByName(productsData.alternateSearch.expectedPartialName!);
    await productDetailPage.expectLoaded();
    await productDetailPage.addToCart();
    await productDetailPage.expectAddedModal();
    await productDetailPage.continueShoppingFromModal();

    // Navigate away and back
    await productsPage.open();
    await cartPage.open();
    await cartPage.expectItemCount(1);
    const names = await cartPage.getProductNames();
    expect(names.some((n) => n.includes(productsData.alternateSearch.expectedPartialName!))).toBeTruthy();
    assertion('Cart persists product after navigating away and returning');

    // Cleanup
    await homePage.goto('/');
    await homePage.dismissOverlays();
    await homePage.deleteAccount();
    void user;
  });
});
