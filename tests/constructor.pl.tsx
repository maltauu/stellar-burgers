import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const INGREDIENTS_HAR = 'tests/hars/ingredients.har';
const USER_HAR = 'tests/hars/user.har';
const ORDER_HAR = 'tests/hars/order.har';

const API_ROUTES = '**/api/**';
const USER_ROUTE = '**/api/auth/user';
const ORDER_ROUTE = '**/api/orders';

const ACCESS_TOKEN = 'Bearer test-access-token';
const REFRESH_TOKEN = 'test-refresh-token';
const APP_URL = 'http://localhost:4000';

const BUN_NAME = 'Краторная булка N-200i';
const ANOTHER_BUN_NAME = 'Флюоресцентная булка R2-D3';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';
const ORDER_NUMBER = '98765';
const INGREDIENT_MODAL_TITLE = 'Детали ингредиента';

const getIngredientCard = (page: Page, name: string): Locator =>
  page.getByTestId('burger-ingredients').getByRole('listitem').filter({ hasText: name });

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await getIngredientCard(page, name).getByRole('button', { name: 'Добавить' }).click();
};

const getConstructor = (page: Page): Locator => page.getByTestId('burger-constructor');

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(INGREDIENTS_HAR, { url: API_ROUTES, notFound: 'abort' });
});

test.describe('добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('булка добавляется в верх и низ бургера', async ({ page }) => {
    const burgerConstructor = getConstructor(page);

    await addIngredient(page, BUN_NAME);

    await expect(burgerConstructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(burgerConstructor.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
    await expect(getIngredientCard(page, BUN_NAME).locator('.counter__num')).toHaveText(
      '2'
    );
  });

  test('новая булка заменяет выбранную ранее', async ({ page }) => {
    const burgerConstructor = getConstructor(page);

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, ANOTHER_BUN_NAME);

    await expect(
      burgerConstructor.getByText(`${ANOTHER_BUN_NAME} (верх)`)
    ).toBeVisible();
    await expect(burgerConstructor.getByText(`${ANOTHER_BUN_NAME} (низ)`)).toBeVisible();
    await expect(burgerConstructor.getByText(BUN_NAME)).toHaveCount(0);
  });

  test('начинка и соус добавляются в середину бургера', async ({ page }) => {
    const burgerConstructor = getConstructor(page);

    await addIngredient(page, MAIN_NAME);
    await addIngredient(page, SAUCE_NAME);
    await addIngredient(page, MAIN_NAME);

    await expect(burgerConstructor.getByText(MAIN_NAME)).toHaveCount(2);
    await expect(burgerConstructor.getByText(SAUCE_NAME)).toHaveCount(1);
    await expect(burgerConstructor.getByText('Выберите начинку')).toHaveCount(0);
    await expect(getIngredientCard(page, MAIN_NAME).locator('.counter__num')).toHaveText(
      '2'
    );
  });
});

test.describe('модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await getIngredientCard(page, MAIN_NAME).getByRole('link').click();
  });

  test('открывается с данными ингредиента, по которому кликнули', async ({ page }) => {
    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();
    await expect(modal.getByText(INGREDIENT_MODAL_TITLE)).toBeVisible();
    await expect(modal.getByRole('heading', { name: MAIN_NAME })).toBeVisible();
    await expect(modal.getByText(BUN_NAME)).toHaveCount(0);
    await expect(modal.getByText('4242')).toBeVisible();
    await expect(page).toHaveURL(/\/ingredients\/643d69a5c3f7b9001cfa0941$/);
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await page.getByTestId('modal').getByRole('button', { name: 'Закрыть' }).click();

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL(`${APP_URL}/`);
  });
});

test.describe('создание заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.routeFromHAR(USER_HAR, { url: USER_ROUTE, notFound: 'abort' });
    await page.routeFromHAR(ORDER_HAR, { url: ORDER_ROUTE, notFound: 'abort' });
    await context.addCookies([
      { name: 'accessToken', value: ACCESS_TOKEN, url: APP_URL },
    ]);
    await context.addInitScript((refreshToken: string) => {
      window.localStorage.setItem('refreshToken', refreshToken);
    }, REFRESH_TOKEN);
    await page.goto('/');
  });

  test.afterEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('оформляет заказ, показывает его номер и очищает конструктор', async ({
    page,
  }) => {
    const burgerConstructor = getConstructor(page);

    await expect(page.getByText('Тестовый пользователь')).toBeVisible();

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN_NAME);
    await addIngredient(page, SAUCE_NAME);
    await expect(burgerConstructor.getByText(MAIN_NAME)).toBeVisible();

    await burgerConstructor.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(ORDER_NUMBER, { exact: true })).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(burgerConstructor.getByText('Выберите начинку')).toBeVisible();
    await expect(burgerConstructor.getByText(BUN_NAME)).toHaveCount(0);
    await expect(burgerConstructor.getByText(MAIN_NAME)).toHaveCount(0);

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(page.getByTestId('modal')).toHaveCount(0);
  });
});
