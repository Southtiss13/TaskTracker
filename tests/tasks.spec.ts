import "dotenv/config";
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
    fullName: "Playwright Tasks User",
    email: `test-${suffix}@example.com`,
    password: "Password123",
  };
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

  await expect(page).toHaveURL(/\/login$/);
}

async function verifyUserEmail(email: string) {
  await pool.query(
    `
      UPDATE users
      SET email_verified = NOW(), updated_at = NOW()
      WHERE email = $1
    `,
    [email],
  );
}

async function loginUser(page: Page, user: ReturnType<typeof createTestUser>) {
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();
}

test("user can create, update, and delete a task", async ({ page }) => {
  const user = createTestUser();
  const taskTitle = `Playwright Task ${Date.now()}`;
  const updatedDescription = "Task completed during the E2E test.";

  await registerUser(page, user);
  await verifyUserEmail(user.email);
  await loginUser(page, user);

  await page.getByRole("button", { name: "Create task" }).click();

  const createDialog = page.getByRole("dialog", { name: "Add something new" });
  await createDialog.getByLabel("Title").fill(taskTitle);
  await createDialog
    .getByLabel("Description")
    .fill("Task created during the E2E test.");
  await createDialog.getByLabel("Priority").selectOption("high");
  await createDialog.getByRole("button", { name: "Create task" }).click();

  await expect(createDialog).toBeHidden();

  const taskCard = page.locator("article").filter({
    has: page.getByRole("heading", { name: taskTitle }),
  });

  await expect(taskCard.getByRole("heading", { name: taskTitle })).toBeVisible();

  await taskCard.getByRole("button", { name: "Edit task" }).click();

  const editDialog = page.getByRole("dialog", { name: `Update ${taskTitle}` });
  await editDialog.getByLabel("Description").fill(updatedDescription);
  await editDialog.getByLabel("Status").selectOption("done");
  await editDialog.getByRole("button", { name: "Save changes" }).click();

  await expect(editDialog).toBeHidden();
  await expect(taskCard.getByText("done", { exact: true })).toBeVisible();
  await expect(taskCard.getByText(updatedDescription)).toBeVisible();

  await taskCard.getByRole("button", { name: "Delete" }).click();

  const deleteDialog = page.getByRole("dialog", { name: "Delete task?" });
  await deleteDialog.getByRole("button", { name: "Delete task" }).click();

  await expect(deleteDialog).toBeHidden();
  await expect(page.getByRole("heading", { name: taskTitle })).toHaveCount(0);
});
