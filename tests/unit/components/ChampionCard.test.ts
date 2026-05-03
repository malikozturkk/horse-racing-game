import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ChampionCard from "../../../src/components/race/ChampionCard.vue";
import { buildHorse } from "../../factories/horses";

describe("components/race/ChampionCard", () => {
  it("renders the champion name, season number and stats", () => {
    const horse = buildHorse({ id: 7, name: "Tulpar", condition: 92 });
    const wrapper = mount(ChampionCard, {
      props: {
        champion: horse,
        totalPoints: 38,
        wins: 3,
        averageTimeMs: 67_500,
        seasonNumber: 4,
      },
    });
    expect(wrapper.text()).toContain("Tulpar");
    expect(wrapper.text()).toContain("#4");
    expect(wrapper.text()).toContain("3 birincilik");
    expect(wrapper.text()).toContain("38 puan");
    expect(wrapper.text()).toContain("FORMA #7");
  });

  it("formats the average time as m:ss.SSS", () => {
    const horse = buildHorse({ id: 1, name: "Aras" });
    const wrapper = mount(ChampionCard, {
      props: {
        champion: horse,
        totalPoints: 10,
        wins: 1,
        averageTimeMs: 75_321,
        seasonNumber: 1,
      },
    });
    expect(wrapper.text()).toContain("1:15.321");
  });
});
