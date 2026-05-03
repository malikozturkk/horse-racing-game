import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ProgramRoundItem from "../../../src/components/race/ProgramRoundItem.vue";
import { buildRound } from "../../factories/rounds";
import { buildHorses } from "../../factories/horses";
import type { Horse } from "../../../src/domain/horse/types";
import type { HorseId } from "../../../src/domain/shared/types";

const buildHorseMap = (count: number): Readonly<Record<HorseId, Horse>> => {
  const out: Record<HorseId, Horse> = {} as Record<HorseId, Horse>;
  for (const h of buildHorses({ count })) {
    out[h.id] = h;
  }
  return out;
};

describe("components/race/ProgramRoundItem", () => {
  const horsesById = buildHorseMap(20);

  it("shows distance, lineup count and round name", () => {
    const round = buildRound({ index: 0 });
    const wrapper = mount(ProgramRoundItem, {
      props: { round, horsesById, isCurrent: false },
    });
    expect(wrapper.text()).toContain(round.name);
    expect(wrapper.text()).toContain(`${round.distanceMeters}m`);
    expect(wrapper.text()).toContain(`${round.lineup.length} KOŞUCU`);
  });

  it("badge reflects round status: pending → BEKLİYOR", () => {
    const round = buildRound({ status: "pending" });
    const wrapper = mount(ProgramRoundItem, {
      props: { round, horsesById, isCurrent: false },
    });
    expect(wrapper.text()).toContain("BEKLİYOR");
  });

  it("badge says SIRADA when isCurrent or queued", () => {
    const round = buildRound({ status: "pending" });
    const wrapper = mount(ProgramRoundItem, {
      props: { round, horsesById, isCurrent: true },
    });
    expect(wrapper.text()).toContain("SIRADA");
    expect(wrapper.classes()).toContain("prg-item--current");
    expect(wrapper.attributes("aria-current")).toBe("step");
  });

  it("badge says CANLI for live status", () => {
    const round = buildRound({ status: "live" });
    const wrapper = mount(ProgramRoundItem, {
      props: { round, horsesById, isCurrent: false },
    });
    expect(wrapper.text()).toContain("CANLI");
  });

  it("badge says TAMAM and renders completed modifier", () => {
    const round = buildRound({ status: "completed" });
    const wrapper = mount(ProgramRoundItem, {
      props: { round, horsesById, isCurrent: false },
    });
    expect(wrapper.text()).toContain("TAMAM");
    expect(wrapper.classes()).toContain("prg-item--completed");
    expect(wrapper.text()).toContain("✓");
  });

  it("badge says FOTO FİNİŞ for photoFinish status", () => {
    const round = buildRound({ status: "photoFinish" });
    const wrapper = mount(ProgramRoundItem, {
      props: { round, horsesById, isCurrent: false },
    });
    expect(wrapper.text()).toContain("FOTO FİNİŞ");
  });
});
