import { test, expect } from "./fixtures";
import {
  generateBtn,
  startBtn,
  statusBadge,
  viewState,
  waitForRoundResult,
  waitForViewState,
} from "./helpers";

test.describe("Hipodrom — happy paths", () => {
  test("initial empty state shows the bekliyor badge", async ({
    page,
    goToApp,
  }) => {
    await goToApp({ seed: 1 });
    expect(await viewState(page)).toBe("empty");
    await expect(statusBadge(page)).toContainText(/Hazır|BEKLİYOR/i);
  });

  test("generating a program reveals 6 rounds", async ({ page, goToApp }) => {
    await goToApp({ seed: 1 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await expect(statusBadge(page)).toContainText("Program Hazır");
    const rounds = page.getByTestId("program-rounds").locator(".prg-item");
    await expect(rounds).toHaveCount(6);
  });

  test("starting the race transitions to racing and produces a result", async ({
    page,
    goToApp,
  }) => {
    await goToApp({ seed: 1 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await startBtn(page).click();
    await waitForViewState(page, "racing");
    await expect(statusBadge(page)).toContainText(/Yarış Sürüyor|Foto Finiş/);
    await waitForRoundResult(page, 0);
    await waitForViewState(page, "roundFinished");
    const results = page.getByTestId("results-list").locator(".result-row");
    await expect(results).toHaveCount(10);
  });

  test("rounds advance sequentially as the user starts each one", async ({
    page,
    goToApp,
  }) => {
    test.setTimeout(120_000);
    await goToApp({ seed: 11 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");

    for (let i = 0; i < 3; i++) {
      await startBtn(page).click();
      await waitForRoundResult(page, i, 60_000);
    }

    const completedRounds = page
      .getByTestId("program-rounds")
      .locator(".prg-item--completed");
    await expect(completedRounds).toHaveCount(3);
  });
});
