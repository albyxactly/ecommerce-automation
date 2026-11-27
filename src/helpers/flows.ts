import { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SignupLoginPage } from '../pages/SignupLoginPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { UserProfile, FakePayment, buildSignupUser } from '../utils/testData';
import { withErrorHandling } from '../utils/errorHandler';
import { step } from '../utils/logger';

export interface RegisteredUser extends UserProfile {
  email: string;
}

/**
 * Register a fresh unique user and land on the home page as logged-in.
 */
export async function registerNewUser(
  page: Page,
  overrides: Partial<UserProfile> = {},
): Promise<RegisteredUser> {
  const user = buildSignupUser(overrides);
  const home = new HomePage(page);
  const signupLogin = new SignupLoginPage(page);
  const accountInfo = new AccountInfoPage(page);

  await withErrorHandling(page, 'Open home and start signup', async () => {
    await home.open();
    await home.goToSignupLogin();
    await signupLogin.expectLoaded();
  });

  await withErrorHandling(page, 'Submit signup credentials', async () => {
    await signupLogin.startSignup(user.name, user.email);
    await accountInfo.expectLoaded();
  });

  await withErrorHandling(page, 'Complete account information', async () => {
    await accountInfo.fillAccountDetails(user);
    await accountInfo.submit();
    await accountInfo.expectAccountCreated();
    await accountInfo.continueAfterCreate();
  });

  await withErrorHandling(page, 'Verify logged in after signup', async () => {
    await home.expectLoggedIn(user.name);
  });

  step(`Registered user ${user.email}`);
  return user;
}

export async function loginUser(page: Page, email: string, password: string, expectedName?: string): Promise<void> {
  const home = new HomePage(page);
  const signupLogin = new SignupLoginPage(page);

  await withErrorHandling(page, 'Login existing user', async () => {
    await home.open();
    await home.goToSignupLogin();
    await signupLogin.login(email, password);
    await home.expectLoggedIn(expectedName);
  });
}

export async function searchAndAddToCart(
  page: Page,
  keyword: string,
  expectedName: string,
  quantity = 1,
): Promise<string> {
  const products = new ProductsPage(page);
  const detail = new ProductDetailPage(page);

  await withErrorHandling(page, 'Search and open product', async () => {
    await products.open();
    await products.search(keyword);
    await products.expectSearchResultsContain(expectedName);
    await products.openProductByName(expectedName);
    await detail.expectLoaded();
  });

  const productName = await detail.getProductName();

  await withErrorHandling(page, 'Add product to cart', async () => {
    if (quantity !== 1) {
      await detail.setQuantity(quantity);
    }
    await detail.addToCart();
    await detail.expectAddedModal();
    await detail.viewCartFromModal();
  });

  return productName;
}

export async function checkoutWithFakePayment(
  page: Page,
  productName: string,
  payment: FakePayment,
  addressHint?: string,
): Promise<void> {
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  await withErrorHandling(page, 'Validate cart and checkout', async () => {
    await cart.expectLoaded();
    await cart.expectProductInCart(productName);
    await cart.proceedToCheckout();
    await checkout.expectLoaded();
    await checkout.expectReviewOrderContains(productName);
    if (addressHint) {
      await checkout.expectAddressVisible(addressHint);
    }
  });

  await withErrorHandling(page, 'Complete demo payment UI', async () => {
    await checkout.placeOrder('Automation test order — fake payment only');
    await checkout.expectPaymentPage();
    await checkout.fillFakePayment(payment);
    await checkout.submitPaymentForUiValidation();
    await checkout.expectOrderPlacedConfirmation();
  });
}
