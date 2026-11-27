import { test, expect } from '../../src/fixtures/testFixtures';
import { registerNewUser } from '../../src/helpers/flows';
import { assertion } from '../../src/utils/logger';

test.describe('Authentication negative scenarios @negative', () => {
  test('Invalid login credentials show an error and stay on login page', async ({
    homePage,
    signupLoginPage,
    testUsers,
  }) => {
    await homePage.open();
    await homePage.goToSignupLogin();
    await signupLoginPage.expectLoaded();

    await signupLoginPage.login(
      testUsers.invalidCredentials.email,
      testUsers.invalidCredentials.password,
    );

    await signupLoginPage.expectInvalidLoginError();
    await signupLoginPage.expectStillOnLoginPage();
    assertion('Invalid login correctly blocked without granting session');
    await expect(homePage.loggedInAs()).toHaveCount(0);
  });

  test('Duplicate signup email is rejected', async ({
    page,
    homePage,
    signupLoginPage,
  }) => {
    // Create a real user first, then attempt signup with the same email
    const user = await registerNewUser(page);

    await homePage.logout();
    await signupLoginPage.expectLoaded();

    await signupLoginPage.startSignup(user.name, user.email);
    await signupLoginPage.expectSignupEmailExistsError();
    await signupLoginPage.expectStillOnLoginPage();
    assertion('Duplicate email signup correctly rejected');

    // Cleanup
    await signupLoginPage.login(user.email, user.password);
    await homePage.expectLoggedIn(user.name);
    await homePage.deleteAccount();
  });

  test('Signup with empty email does not advance to account info', async ({
    homePage,
    signupLoginPage,
    accountInfoPage,
    page,
  }) => {
    await homePage.open();
    await homePage.goToSignupLogin();
    await signupLoginPage.expectLoaded();

    await signupLoginPage.startSignup('No Email User', '');
    // HTML5 validation should keep us on /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('[data-qa="password"]')).toHaveCount(0);
    assertion('Empty signup email blocked by form validation');
  });
});
