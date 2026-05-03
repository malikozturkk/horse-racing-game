import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ResultRow from "../../../src/components/race/ResultRow.vue";
import { buildHorse } from "../../factories/horses";

describe("components/race/ResultRow", () => {
  const horse = buildHorse({ name: "Tulpar" });

  it("renders rank, horse name and trailing label", () => {
    const wrapper = mount(ResultRow, {
      props: { rank: 1, horse, trailing: "0:60.000" },
    });
    expect(wrapper.text()).toContain("1");
    expect(wrapper.text()).toContain("Tulpar");
    expect(wrapper.text()).toContain("0:60.000");
  });

  it("applies the gold podium class for rank 1", () => {
    const wrapper = mount(ResultRow, { props: { rank: 1, horse } });
    expect(wrapper.classes()).toContain("result-row--gold");
  });

  it("applies silver and bronze classes for rank 2 and 3", () => {
    const w2 = mount(ResultRow, { props: { rank: 2, horse } });
    const w3 = mount(ResultRow, { props: { rank: 3, horse } });
    expect(w2.classes()).toContain("result-row--silver");
    expect(w3.classes()).toContain("result-row--bronze");
  });

  it("does not apply a podium class for ranks > 3", () => {
    const wrapper = mount(ResultRow, { props: { rank: 4, horse } });
    expect(wrapper.classes().some((c) => c.includes("--gold"))).toBe(false);
    expect(wrapper.classes().some((c) => c.includes("--silver"))).toBe(false);
    expect(wrapper.classes().some((c) => c.includes("--bronze"))).toBe(false);
  });

  it("renders the highlighted modifier", () => {
    const wrapper = mount(ResultRow, {
      props: { rank: 5, horse, highlighted: true },
    });
    expect(wrapper.classes()).toContain("result-row--highlighted");
  });

  it("renders the trailing slot when provided", () => {
    const wrapper = mount(ResultRow, {
      props: { rank: 1, horse },
      slots: { trailing: "<span id='extra' />" },
    });
    expect(wrapper.find("#extra").exists()).toBe(true);
  });

  it("omits the trailing label when null", () => {
    const wrapper = mount(ResultRow, {
      props: { rank: 5, horse, trailing: null },
    });
    expect(wrapper.find(".result-row__trailing").exists()).toBe(false);
  });
});
