import { expect, test, type Page } from "@playwright/test";

function createTestUser() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    fullName: "Playwright Auth User",
    email: `test-${suffix}@example.com`,
    password: "TaskTracker123!",
  };
}

async function registerUser(page: Page, user: ReturnType<typeof createTestUser>) {
  await page.goto("/register");

  await page.getByLabel("Full name").fill(user.fullName);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
await page.getByLabel("Confirm password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
}

async function loginUser(page: Page, user: ReturnType<typeof createTestUser>) {
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

test("user can register, log in, reach tasks, and log out", async ({ page }) => {
  const user = createTestUser();

  await registerUser(page, user);
  await expect(page).toHaveURL(/\/login$/);

  await loginUser(page, user);
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
