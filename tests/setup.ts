import { afterEach, beforeEach, vi } from "vitest";
import { config } from "@vue/test-utils";
import { resetServices } from "../src/infrastructure/container";

config.global.stubs = {
  ...config.global.stubs,
  RouterLink: {
    name: "RouterLinkStub",
    props: ["to"],
    template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
  },
  RouterView: true,
  HorseWithJockey: {
    name: "HorseWithJockeyStub",
    props: ["horseNumber", "visual", "width", "animate"],
    template:
      '<svg data-stub="horse-with-jockey" :data-horse="horseNumber" />',
  },
  HorseProfile: {
    name: "HorseProfileStub",
    props: ["visual", "size"],
    template: '<span data-stub="horse-profile" />',
  },
  BarnDoorsIntro: {
    name: "BarnDoorsIntroStub",
    emits: ["finished"],
    template: '<div data-stub="barn-doors" />',
  },
  transition: false,
};

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  resetServices();
  vi.useRealTimers();
});
