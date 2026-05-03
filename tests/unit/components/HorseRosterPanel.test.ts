import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import HorseRosterPanel from "../../../src/components/race/HorseRosterPanel.vue";
import { buildHorses } from "../../factories/horses";
import { asHorseId } from "../../../src/domain/shared/types";

describe("components/race/HorseRosterPanel", () => {
  it("renders one row per horse", () => {
    const horses = buildHorses({ count: 5 });
    const wrapper = mount(HorseRosterPanel, { props: { horses } });
    expect(wrapper.findAll(".roster-row")).toHaveLength(5);
  });

  it("highlights the rows whose ids are in highlightedIds", () => {
    const horses = buildHorses({ count: 4 });
    const wrapper = mount(HorseRosterPanel, {
      props: {
        horses,
        highlightedIds: [asHorseId(1), asHorseId(3)],
      },
    });
    const rows = wrapper.findAll(".roster-row");
    expect(rows[0]?.classes()).toContain("roster-row--highlighted");
    expect(rows[1]?.classes()).not.toContain("roster-row--highlighted");
    expect(rows[2]?.classes()).toContain("roster-row--highlighted");
    expect(rows[3]?.classes()).not.toContain("roster-row--highlighted");
  });

  it("shows the count badge", () => {
    const horses = buildHorses({ count: 3 });
    const wrapper = mount(HorseRosterPanel, { props: { horses } });
    expect(wrapper.text()).toContain("3 ADET");
  });

  it("renders a custom title when supplied", () => {
    const horses = buildHorses({ count: 2 });
    const wrapper = mount(HorseRosterPanel, {
      props: { horses, title: "Özel Liste" },
    });
    expect(wrapper.text()).toContain("Özel Liste");
  });
});
