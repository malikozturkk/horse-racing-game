import { expect, type Page } from "@playwright/test";

export const root = (page: Page) => page.getByTestId("hipodrom-root");

export const viewState = async (page: Page): Promise<string | null> =>
  root(page).getAttribute("data-view-state");

export const generateBtn = (page: Page) => page.getByTestId("generate-btn");
export const startBtn = (page: Page) => page.getByTestId("start-btn");
export const newSeasonBtn = (page: Page) => page.getByTestId("new-season-btn");
export const statusBadge = (page: Page) => page.getByTestId("status-badge");

export const waitForViewState = async (
  page: Page,
  expected: string,
  timeout = 30_000
): Promise<void> => {
  await expect.poll(() => viewState(page), { timeout }).toBe(expected);
};

export const waitForRoundResult = async (
  page: Page,
  index: number,
  timeout = 60_000
): Promise<void> => {
  await expect
    .poll(
      async () => {
        const round = page.getByTestId(`program-round-${index}`);
        if ((await round.count()) === 0) return null;
        const cls = await round.getAttribute("class");
        return cls?.includes("prg-item--completed") ?? false;
      },
      { timeout }
    )
    .toBe(true);
};
