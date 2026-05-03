import { test, expect } from "./fixtures";
import {
  generateBtn,
  startBtn,
  waitForRoundResult,
  waitForViewState,
} from "./helpers";

test.describe("Hipodrom — result ordering", () => {
  test("finished round results show ranks 1..N in ascending order", async ({
    page,
    goToApp,
  }) => {
    await goToApp({ seed: 8 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await startBtn(page).click();
    await waitForRoundResult(page, 0);
    await waitForViewState(page, "roundFinished");

    const ranks = await page
      .getByTestId("results-list")
      .locator(".result-row__rank")
      .allInnerTexts();
    const numeric = ranks.map((r) => Number.parseInt(r.trim(), 10));
    expect(numeric).toHaveLength(10);
    for (let i = 0; i < numeric.length; i++) {
      expect(numeric[i]).toBe(i + 1);
    }
  });

  test("the round 1 podium contains gold/silver/bronze rows", async ({
    page,
    goToApp,
  }) => {
    await goToApp({ seed: 9 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await startBtn(page).click();
    await waitForRoundResult(page, 0);
    await waitForViewState(page, "roundFinished");

    const list = page.getByTestId("results-list");
    await expect(list.locator(".result-row--gold")).toHaveCount(1);
    await expect(list.locator(".result-row--silver")).toHaveCount(1);
    await expect(list.locator(".result-row--bronze")).toHaveCount(1);
  });
});
