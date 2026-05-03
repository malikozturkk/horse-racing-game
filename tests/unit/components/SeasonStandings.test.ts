import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SeasonStandings from "../../../src/components/race/SeasonStandings.vue";
import { buildHorses } from "../../factories/horses";
import { asHorseId } from "../../../src/domain/shared/types";
import type { Horse } from "../../../src/domain/horse/types";
import type { HorseId } from "../../../src/domain/shared/types";

const buildHorseMap = (count = 4): Readonly<Record<HorseId, Horse>> => {
  const out: Record<HorseId, Horse> = {} as Record<HorseId, Horse>;
  for (const h of buildHorses({ count })) out[h.id] = h;
  return out;
};

describe("components/race/SeasonStandings", () => {
  it("renders an empty placeholder when there are no standings", () => {
    const wrapper = mount(SeasonStandings, {
      props: { standings: [], horsesById: buildHorseMap() },
    });
    expect(wrapper.text()).toContain("Henüz sıralama yok");
  });

  it("renders a row per standing limited to `limit`", () => {
    const standings = [
      { horseId: asHorseId(1), totalPoints: 30, wins: 2, races: 4, averageTimeMs: 60_000 },
      { horseId: asHorseId(2), totalPoints: 21, wins: 1, races: 4, averageTimeMs: 61_000 },
      { horseId: asHorseId(3), totalPoints: 14, wins: 0, races: 4, averageTimeMs: 62_000 },
      { horseId: asHorseId(4), totalPoints: 7, wins: 0, races: 4, averageTimeMs: 63_000 },
    ];
    const wrapper = mount(SeasonStandings, {
      props: { standings, horsesById: buildHorseMap(), limit: 3 },
    });
    expect(wrapper.findAll(".result-row")).toHaveLength(3);
    expect(wrapper.text()).toContain("30");
    expect(wrapper.text()).toContain("birincilik");
  });

  it("highlights only the leader as gold", () => {
    const standings = [
      { horseId: asHorseId(1), totalPoints: 30, wins: 2, races: 4, averageTimeMs: 60_000 },
      { horseId: asHorseId(2), totalPoints: 21, wins: 1, races: 4, averageTimeMs: 61_000 },
    ];
    const wrapper = mount(SeasonStandings, {
      props: { standings, horsesById: buildHorseMap() },
    });
    const rows = wrapper.findAll(".result-row");
    expect(rows[0]?.classes()).toContain("result-row--gold");
    expect(rows[1]?.classes()).not.toContain("result-row--gold");
  });
});
