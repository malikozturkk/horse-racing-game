import { test, expect } from "./fixtures";
import {
  generateBtn,
  startBtn,
  waitForRoundResult,
  waitForViewState,
} from "./helpers";

const CANVAS_MASKS = (page: import("@playwright/test").Page) => [
  page.locator(".lane__horse-svg"),
  page.locator(".result-row__trailing"),
];

test.describe("Visual regression", () => {
  test("initial empty state", async ({ page, goToApp }) => {
    await goToApp({ seed: 1 });
    await waitForViewState(page, "empty");
    await expect(page).toHaveScreenshot("01-empty.png", {
      fullPage: false,
      mask: CANVAS_MASKS(page),
    });
  });

  test("scheduled state — program ready", async ({ page, goToApp }) => {
    await goToApp({ seed: 1 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("02-scheduled.png", {
      fullPage: false,
      mask: CANVAS_MASKS(page),
    });
  });

  test("racing state — paused for stability", async ({ page, goToApp }) => {
    await goToApp({ seed: 1 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await startBtn(page).click();
    await waitForViewState(page, "racing");
    await startBtn(page).click();
    await waitForViewState(page, "paused");
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("03-paused.png", {
      fullPage: false,
      mask: CANVAS_MASKS(page),
    });
  });

  test("round finished — results visible", async ({ page, goToApp }) => {
    await goToApp({ seed: 1 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await startBtn(page).click();
    await waitForRoundResult(page, 0);
    await waitForViewState(page, "roundFinished");
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("04-round-finished.png", {
      fullPage: false,
      mask: CANVAS_MASKS(page),
    });
  });
});
