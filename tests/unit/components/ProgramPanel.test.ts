import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ProgramPanel from "../../../src/components/race/ProgramPanel.vue";
import { buildRoundSet } from "../../factories/rounds";
import { buildHorses } from "../../factories/horses";
import type { Horse } from "../../../src/domain/horse/types";
import type { HorseId } from "../../../src/domain/shared/types";

const buildHorseMap = (): Readonly<Record<HorseId, Horse>> => {
  const out: Record<HorseId, Horse> = {} as Record<HorseId, Horse>;
  for (const h of buildHorses({ count: 20 })) out[h.id] = h;
  return out;
};

describe("components/race/ProgramPanel", () => {
  it("renders one item per round", () => {
    const rounds = buildRoundSet();
    const wrapper = mount(ProgramPanel, {
      props: { rounds, horsesById: buildHorseMap(), currentRoundIndex: 0 },
    });
    expect(wrapper.findAll(".prg-item")).toHaveLength(rounds.length);
    expect(wrapper.text()).toContain(`${rounds.length} ROUND`);
  });

  it("marks the active round as current", () => {
    const rounds = buildRoundSet();
    const wrapper = mount(ProgramPanel, {
      props: { rounds, horsesById: buildHorseMap(), currentRoundIndex: 2 },
    });
    const items = wrapper.findAll(".prg-item");
    expect(items[2]?.classes()).toContain("prg-item--current");
    expect(items[1]?.classes()).not.toContain("prg-item--current");
  });
});
