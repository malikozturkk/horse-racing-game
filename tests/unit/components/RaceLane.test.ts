import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import RaceLane from "../../../src/components/race/RaceLane.vue";
import { mountWithPinia } from "../../helpers/mount";
import { buildHorse } from "../../factories/horses";

describe("components/race/RaceLane", () => {
  const horse = buildHorse({ name: "Bora" });

  it("clamps progress into [0, 1]", () => {
    const w1 = mountWithPinia(RaceLane, {
      props: { laneNumber: 1, horse, progress: -1 },
    });
    const w2 = mountWithPinia(RaceLane, {
      props: { laneNumber: 2, horse, progress: 5 },
    });
    const w3 = mountWithPinia(RaceLane, {
      props: { laneNumber: 3, horse, progress: 0.5 },
    });
    expect(w1.find(".lane__horse").attributes("style")).toContain(
      "--lane-progress: 0"
    );
    expect(w2.find(".lane__horse").attributes("style")).toContain(
      "--lane-progress: 1"
    );
    expect(w3.find(".lane__horse").attributes("style")).toContain(
      "--lane-progress: 0.5"
    );
  });

  it("treats non-finite progress as 0", () => {
    const wrapper = mountWithPinia(RaceLane, {
      props: { laneNumber: 1, horse, progress: NaN },
    });
    expect(wrapper.find(".lane__horse").attributes("style")).toContain(
      "--lane-progress: 0"
    );
  });

  it("applies the finished modifier", () => {
    const wrapper = mountWithPinia(RaceLane, {
      props: { laneNumber: 1, horse, progress: 1, finished: true },
    });
    expect(wrapper.classes()).toContain("lane--finished");
  });

  it("applies the static modifier", () => {
    const wrapper = mountWithPinia(RaceLane, {
      props: { laneNumber: 1, horse, progress: 0.2, staticOnly: true },
    });
    expect(wrapper.classes()).toContain("lane--static");
  });

  it("renders the horse name tag when showName=true", () => {
    const wrapper = mountWithPinia(RaceLane, {
      props: { laneNumber: 1, horse, progress: 0, showName: true },
    });
    expect(wrapper.text()).toContain("Bora");
  });

  it("hides the horse name tag when showName=false", () => {
    const wrapper = mountWithPinia(RaceLane, {
      props: { laneNumber: 1, horse, progress: 0, showName: false },
    });
    expect(wrapper.find(".lane__horse-tag").exists()).toBe(false);
  });

  it("includes the lane number in the aria-label", () => {
    const wrapper = mount(RaceLane, {
      global: {
        stubs: {
          HorseWithJockey: true,
        },
      },
      props: { laneNumber: 7, horse },
    });
    expect(wrapper.attributes("aria-label")).toContain("Şerit 7");
    expect(wrapper.attributes("aria-label")).toContain(horse.name);
  });
});
