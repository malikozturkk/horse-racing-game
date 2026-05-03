import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import RaceTrack from "../../../src/components/race/RaceTrack.vue";
import type { Horse } from "../../../src/domain/horse/types";
import type { HorseId } from "../../../src/domain/shared/types";
import { asHorseId } from "../../../src/domain/shared/types";
import { buildHorses } from "../../factories/horses";
import { buildParticipantRuntime } from "../../factories/runtime";

const horseMap = (count: number): Readonly<Record<HorseId, Horse>> => {
  const out: Record<HorseId, Horse> = {} as Record<HorseId, Horse>;
  for (const h of buildHorses({ count })) out[h.id] = h;
  return out;
};

describe("components/race/RaceTrack", () => {
  it("renders a lane per known participant", () => {
    const wrapper = mount(RaceTrack, {
      global: { stubs: { HorseWithJockey: true } },
      props: {
        title: "Açılış Koşusu",
        distance: 1200,
        roundNumber: 1,
        horsesById: horseMap(4),
        status: "lineup",
        participants: [
          buildParticipantRuntime({ horseId: asHorseId(1), lane: 0 }),
          buildParticipantRuntime({ horseId: asHorseId(2), lane: 1 }),
          buildParticipantRuntime({ horseId: asHorseId(3), lane: 2 }),
          buildParticipantRuntime({ horseId: asHorseId(99), lane: 3 }),
        ],
      },
    });
    expect(wrapper.findAll(".track__lane")).toHaveLength(3);
  });

  it("sorts lanes by lane number", () => {
    const wrapper = mount(RaceTrack, {
      global: { stubs: { HorseWithJockey: true } },
      props: {
        title: "Sprint",
        distance: 1400,
        roundNumber: 2,
        horsesById: horseMap(3),
        status: "live",
        participants: [
          buildParticipantRuntime({ horseId: asHorseId(2), lane: 2 }),
          buildParticipantRuntime({ horseId: asHorseId(1), lane: 0 }),
          buildParticipantRuntime({ horseId: asHorseId(3), lane: 1 }),
        ],
      },
    });
    const lanes = wrapper.findAll(".track__lane");
    expect(lanes[0]?.text()).toContain("1");
    expect(lanes[1]?.text()).toContain("2");
    expect(lanes[2]?.text()).toContain("3");
  });

  it("renders the right status badge per status prop", () => {
    const cases = [
      ["live", "CANLI"],
      ["photoFinish", "FOTO FİNİŞ"],
      ["completed", "TAMAM"],
      ["paused", "DURAKLATILDI"],
      ["lineup", "SIRADA"],
    ] as const;
    for (const [status, label] of cases) {
      const wrapper = mount(RaceTrack, {
        global: { stubs: { HorseWithJockey: true } },
        props: {
          title: "x",
          distance: 1200,
          roundNumber: 1,
          horsesById: horseMap(1),
          status,
          participants: [
            buildParticipantRuntime({ horseId: asHorseId(1), lane: 0 }),
          ],
        },
      });
      expect(wrapper.text()).toContain(label);
    }
  });

  it("includes the distance label", () => {
    const wrapper = mount(RaceTrack, {
      global: { stubs: { HorseWithJockey: true } },
      props: {
        title: "Mil Yarışı",
        distance: 1600,
        roundNumber: 3,
        horsesById: horseMap(1),
        status: "live",
        participants: [
          buildParticipantRuntime({ horseId: asHorseId(1), lane: 0 }),
        ],
      },
    });
    expect(wrapper.text()).toContain("1600m");
  });
});
