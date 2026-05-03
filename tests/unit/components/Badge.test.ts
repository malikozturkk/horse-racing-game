import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Badge from "../../../src/components/ui/Badge.vue";

describe("components/ui/Badge", () => {
  it("renders the default slot", () => {
    const wrapper = mount(Badge, { slots: { default: "LIVE" } });
    expect(wrapper.text()).toContain("LIVE");
  });

  it("applies the variant class", () => {
    const wrapper = mount(Badge, {
      props: { variant: "danger" },
      slots: { default: "Hot" },
    });
    expect(wrapper.classes()).toContain("badge--danger");
  });

  it("renders the dot when dot=true", () => {
    const wrapper = mount(Badge, {
      props: { dot: true },
      slots: { default: "Hi" },
    });
    expect(wrapper.find(".badge__dot").exists()).toBe(true);
  });

  it("emits 'badge-click' when interactive", async () => {
    const wrapper = mount(Badge, {
      props: { interactive: true },
      slots: { default: "Click" },
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("badge-click")).toHaveLength(1);
  });

  it("does not emit when disabled (even if interactive)", async () => {
    const wrapper = mount(Badge, {
      props: { interactive: true, disabled: true },
      slots: { default: "Off" },
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("badge-click")).toBeUndefined();
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });

  it("supports keyboard activation when interactive", async () => {
    const wrapper = mount(Badge, {
      props: { interactive: true },
      slots: { default: "kbd" },
    });
    await wrapper.trigger("keydown.enter");
    expect(wrapper.emitted("badge-click")).toHaveLength(1);
  });

  it("renders the icon and trailing slots", () => {
    const wrapper = mount(Badge, {
      slots: {
        default: "x",
        icon: "<i id='ic' />",
        trailing: "<i id='tr' />",
      },
    });
    expect(wrapper.find("#ic").exists()).toBe(true);
    expect(wrapper.find("#tr").exists()).toBe(true);
  });
});
