import { test as base, expect, type Page } from "@playwright/test";

const STABILIZE_CSS = `
  *, *::before, *::after {
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
`;

export interface AppOptions {
  readonly seed?: number;
  readonly path?: string;
}

export const test = base.extend<{
  goToApp: (options?: AppOptions) => Promise<void>;
}>({
  goToApp: async ({ page }, use) => {
    await use(async (options: AppOptions = {}) => {
      const seed = options.seed ?? 42;
      const path = options.path ?? "/";
      const url = `${path}${path.includes("?") ? "&" : "?"}seed=${seed}`;
      await page.addInitScript(() => {
        Object.defineProperty(window, "matchMedia", {
          configurable: true,
          value: (query: string) => ({
            matches: query.includes("prefers-reduced-motion"),
            media: query,
            onchange: null,
            addListener: () => undefined,
            removeListener: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            dispatchEvent: () => false,
          }),
        });
      });
      await page.goto(url);
      await page.addStyleTag({ content: STABILIZE_CSS });
      await page.waitForSelector('[data-testid="hipodrom-root"]');
    });
  },
});

export { expect, type Page };
