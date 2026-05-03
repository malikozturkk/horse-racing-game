import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ConditionBar from "../../../src/components/ui/ConditionBar.vue";

const fillEl = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find(".condition-bar__fill");

describe("components/ui/ConditionBar", () => {
  it("clamps non-finite/negative values to 0", () => {
    const w1 = mount(ConditionBar, { props: { value: NaN } });
    const w2 = mount(ConditionBar, { props: { value: -50 } });
    expect(w1.attributes("aria-valuenow")).toBe("0");
    expect(w2.attributes("aria-valuenow")).toBe("0");
  });

  it("clamps values above 100", () => {
    const wrapper = mount(ConditionBar, { props: { value: 150 } });
    expect(wrapper.attributes("aria-valuenow")).toBe("100");
  });

  it("rounds non-integer values", () => {
    const wrapper = mount(ConditionBar, { props: { value: 42.7 } });
    expect(wrapper.attributes("aria-valuenow")).toBe("43");
  });

  it("uses the high variant when value >= highThreshold", () => {
    const wrapper = mount(ConditionBar, { props: { value: 80 } });
    expect(fillEl(wrapper).classes()).toContain("condition-bar__fill--high");
    expect(wrapper.text()).toContain("Yüksek");
  });

  it("uses the medium variant in the middle band", () => {
    const wrapper = mount(ConditionBar, { props: { value: 55 } });
    expect(fillEl(wrapper).classes()).toContain("condition-bar__fill--medium");
    expect(wrapper.text()).toContain("Orta");
  });

  it("uses the low variant under mediumThreshold", () => {
    const wrapper = mount(ConditionBar, { props: { value: 10 } });
    expect(fillEl(wrapper).classes()).toContain("condition-bar__fill--low");
    expect(wrapper.text()).toContain("Düşük");
  });

  it("respects custom thresholds", () => {
    const wrapper = mount(ConditionBar, {
      props: { value: 60, highThreshold: 60, mediumThreshold: 30 },
    });
    expect(fillEl(wrapper).classes()).toContain("condition-bar__fill--high");
  });

  it("hides the label when showLabel=false", () => {
    const wrapper = mount(ConditionBar, {
      props: { value: 50, showLabel: false },
    });
    expect(wrapper.find(".condition-bar__label").exists()).toBe(false);
  });

  it("hides the value when showValue=false", () => {
    const wrapper = mount(ConditionBar, {
      props: { value: 50, showValue: false },
    });
    expect(wrapper.find(".condition-bar__value").exists()).toBe(false);
  });

  it("supports custom labels per variant", () => {
    const wrapper = mount(ConditionBar, {
      props: {
        value: 90,
        labels: { high: "Top", medium: "Mid", low: "Down" },
      },
    });
    expect(wrapper.text()).toContain("Top");
  });

  it("exposes accessible aria-valuetext", () => {
    const wrapper = mount(ConditionBar, { props: { value: 35 } });
    expect(wrapper.attributes("aria-valuetext")).toBe("Düşük (35/100)");
  });
});
