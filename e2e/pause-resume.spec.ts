import { test, expect } from "./fixtures";
import {
  generateBtn,
  startBtn,
  statusBadge,
  viewState,
  waitForViewState,
} from "./helpers";

test.describe("Hipodrom — pause / resume", () => {
  test("clicking the start button while racing pauses, clicking again resumes", async ({
    page,
    goToApp,
  }) => {
    await goToApp({ seed: 3 });
    await generateBtn(page).click();
    await waitForViewState(page, "scheduled");
    await startBtn(page).click();
    await waitForViewState(page, "racing");

    await startBtn(page).click();
    await waitForViewState(page, "paused");
    await expect(statusBadge(page)).toContainText("Duraklatıldı");

    await startBtn(page).click();
    await waitForViewState(page, "racing");
    expect(await viewState(page)).toBe("racing");
  });
});
