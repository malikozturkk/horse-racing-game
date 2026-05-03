import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LiveResultsPanel from "../../../src/components/race/LiveResultsPanel.vue";
import { buildRoundSet } from "../../factories/rounds";
import { buildHorses } from "../../factories/horses";
import { buildRoundResult } from "../../factories/results";
import { buildParticipantRuntime } from "../../factories/runtime";
import type { Horse } from "../../../src/domain/horse/types";
import type { HorseId } from "../../../src/domain/shared/types";
import { asHorseId, asRoundId } from "../../../src/domain/shared/types";

const buildHorseMap = (): Readonly<Record<HorseId, Horse>> => {
  const out: Record<HorseId, Horse> = {} as Record<HorseId, Horse>;
  for (const h of buildHorses({ count: 20 })) out[h.id] = h;
  return out;
};

const baseProps = () => ({
  rounds: buildRoundSet(),
  horsesById: buildHorseMap(),
  liveRoundIndex: null as number | null,
  liveStandings: [] as readonly ReturnType<typeof buildParticipantRuntime>[],
  liveDistance: 0,
  results: [] as readonly ReturnType<typeof buildRoundResult>[],
  isLive: false,
  isPaused: false,
  isPhotoFinish: false,
});

describe("components/race/LiveResultsPanel", () => {
  it("renders an empty state when no rounds are live or completed", () => {
    const wrapper = mount(LiveResultsPanel, { props: baseProps() });
    expect(wrapper.text()).toContain("Henüz sıralama yok");
  });

  it("renders the live tab with remaining-distance trailing labels", () => {
    const props = baseProps();
    props.liveRoundIndex = 0;
    props.liveDistance = 1200;
    props.liveStandings = [
      buildParticipantRuntime({
        horseId: asHorseId(1),
        progressMeters: 800,
      }),
      buildParticipantRuntime({
        horseId: asHorseId(2),
        progressMeters: 600,
      }),
    ];
    props.isLive = true;
    const wrapper = mount(LiveResultsPanel, { props });
    expect(wrapper.text()).toContain("CANLI");
    expect(wrapper.text()).toContain("400m");
    expect(wrapper.text()).toContain("600m");
    expect(wrapper.find(".lrp__tab--live").exists()).toBe(true);
  });

  it("renders the completed-results view with podium and times", async () => {
    const props = baseProps();
    const result = buildRoundResult({
      roundId: asRoundId(`${"test-season"}:r1`),
      roundIndex: 0,
    });
    props.results = [result];
    const wrapper = mount(LiveResultsPanel, { props });
    expect(wrapper.text()).toContain("ROUND BİTTİ");
    expect(wrapper.findAll(".result-row").length).toBeGreaterThan(0);
  });

  it("switches between tabs on click", async () => {
    const props = baseProps();
    props.liveRoundIndex = 1;
    props.isLive = true;
    props.liveStandings = [
      buildParticipantRuntime({ horseId: asHorseId(1), progressMeters: 100 }),
    ];
    props.liveDistance = 1200;
    props.results = [
      buildRoundResult({
        roundId: asRoundId("test-season:r1"),
        roundIndex: 0,
      }),
    ];
    const wrapper = mount(LiveResultsPanel, { props });
    const tabs = wrapper.findAll(".lrp__tab");
    expect(tabs.length).toBeGreaterThanOrEqual(2);
    await tabs[0]!.trigger("click");
    expect(wrapper.text()).toContain("BİTİŞ SIRASI");
    await tabs[1]!.trigger("click");
    expect(wrapper.text()).toContain("CANLI SIRALAMA");
  });

  it("shows FOTO FİNİŞ badge when photo finish is active", () => {
    const props = baseProps();
    props.liveRoundIndex = 0;
    props.liveDistance = 1200;
    props.liveStandings = [
      buildParticipantRuntime({ horseId: asHorseId(1), progressMeters: 1199 }),
      buildParticipantRuntime({ horseId: asHorseId(2), progressMeters: 1198 }),
    ];
    props.isLive = true;
    props.isPhotoFinish = true;
    const wrapper = mount(LiveResultsPanel, { props });
    expect(wrapper.text()).toContain("FOTO FİNİŞ");
  });
});
