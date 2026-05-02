import "dotenv/config";
import { createHash } from "crypto";
import { expect, test, type Page } from "@playwright/test";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

test.afterAll(async () => {
  await pool.end();
});

function createTestUser() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    fullName: "Playwright Auth User",
    email: `test-${suffix}@example.com`,
    password: "Password123",
  };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function registerUser(page: Page, user: ReturnType<typeof createTestUser>) {
  await page.goto("/register");

  await page.getByLabel("Full name").fill(user.fullName);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();

  const successDialog = page.getByRole("dialog", { name: "Check your email" });
  await expect(successDialog).toBeVisible();
  await expect(
    successDialog.getByText(
      "Registration successful. Please check your email to verify your account.",
    ),
  ).toBeVisible();
  await successDialog.getByRole("button", { name: "Go to login" }).click();
}

async function getVerificationToken(email: string) {
  const result = await pool.query<{ token: string }>(
    `
      SELECT evt.token
      FROM email_verification_tokens evt
      INNER JOIN users u ON u.id = evt.user_id
      WHERE u.email = $1
      ORDER BY evt.created_at DESC
      LIMIT 1
    `,
    [email],
  );

  const token = result.rows[0]?.token;
  expect(token).toBeTruthy();

  return token!;
}

async function verifyUserEmail(page: Page, email: string) {
  const token = await getVerificationToken(email);

  await page.goto(`/verify-email#token=${token}`);

  await expect(page).toHaveURL(/\/verify-email$/);
  await expect(
    page.getByRole("heading", { name: "Your email is verified" })
  ).toBeVisible();
}

async function loginUser(page: Page, user: ReturnType<typeof createTestUser>) {
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

async function getCookieValue(page: Page, name: string) {
  const cookies = await page.context().cookies();

  return cookies.find((cookie) => cookie.name === name)?.value ?? null;
}

async function removeCookie(page: Page, name: string) {
  const context = page.context();
  const cookies = await context.cookies();

  await context.clearCookies();
  await context.addCookies(cookies.filter((cookie) => cookie.name !== name));
}

async function expectRefreshTokenRow(page: Page) {
  const refreshToken = await getCookieValue(page, "refreshToken");
  expect(refreshToken).toBeTruthy();

  const result = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM refresh_tokens
      WHERE token_hash = $1
      LIMIT 1
    `,
    [hashToken(refreshToken!)],
  );

  expect(result.rows[0]?.id).toBeTruthy();
}

async function deleteCurrentRefreshTokenRow(page: Page) {
  const refreshToken = await getCookieValue(page, "refreshToken");
  expect(refreshToken).toBeTruthy();

  await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [
    hashToken(refreshToken!),
  ]);
}

test("user can register, log in, reach tasks, and log out", async ({ page }) => {
  const user = createTestUser();

  await registerUser(page, user);
  await expect(page).toHaveURL(/\/login$/);

  await loginUser(page, user);
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByText("Please verify your email before logging in."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resend verification email" }).click();
  await expect(
    page.getByText(
      "If this email exists and is not verified, a verification email has been sent.",
    ),
  ).toBeVisible();

  await verifyUserEmail(page, user.email);
  await page.getByRole("link", { name: "Continue to login" }).click();

  await loginUser(page, user);
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();
  await expect(getCookieValue(page, "accessToken")).resolves.toBeTruthy();
  await expectRefreshTokenRow(page);

  await removeCookie(page, "accessToken");
  await page.goto("/tasks");
  await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();
  await expect(getCookieValue(page, "accessToken")).resolves.toBeTruthy();

  await removeCookie(page, "refreshToken");
  await page.goto("/tasks");
  await expect(page).toHaveURL(/\/login$/);
  await expect(getCookieValue(page, "accessToken")).resolves.toBeNull();

  await loginUser(page, user);
  await expect(page).toHaveURL(/\/tasks$/);
  await deleteCurrentRefreshTokenRow(page);
  await page.goto("/tasks");
  await expect(page).toHaveURL(/\/login$/);
  await expect(getCookieValue(page, "accessToken")).resolves.toBeNull();

  await loginUser(page, user);
  await expect(page).toHaveURL(/\/tasks$/);
  await expectRefreshTokenRow(page);

  await page.getByRole("button", { name: "Logout" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(getCookieValue(page, "accessToken")).resolves.toBeNull();
  await expect(getCookieValue(page, "refreshToken")).resolves.toBeNull();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
