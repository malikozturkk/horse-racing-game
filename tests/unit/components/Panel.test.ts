import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Panel from "../../../src/components/ui/Panel.vue";

describe("components/ui/Panel", () => {
  it("renders the default slot inside the body", () => {
    const wrapper = mount(Panel, {
      slots: { default: "<p id='content'>Body</p>" },
    });
    expect(wrapper.find("#content").exists()).toBe(true);
  });

  it("renders the title prop or slot when provided", () => {
    const w1 = mount(Panel, { props: { title: "Header" } });
    expect(w1.text()).toContain("Header");
    const w2 = mount(Panel, { slots: { title: "From Slot" } });
    expect(w2.text()).toContain("From Slot");
  });

  it("omits the header when no title and no actions/title slot", () => {
    const wrapper = mount(Panel, { slots: { default: "Body" } });
    expect(wrapper.find(".panel__head").exists()).toBe(false);
  });

  it("applies the tone modifier", () => {
    const wrapper = mount(Panel, {
      props: { tone: "gold" },
      slots: { default: "x" },
    });
    expect(wrapper.classes()).toContain("panel--gold");
  });

  it("supports flush + scrollY body modifiers", () => {
    const wrapper = mount(Panel, {
      props: { flush: true, scrollY: true },
      slots: { default: "x" },
    });
    const body = wrapper.find(".panel__body");
    expect(body.classes()).toContain("panel__body--scroll");
    expect(body.classes()).toContain("panel__body--flush");
  });

  it("renders the footer slot when provided", () => {
    const wrapper = mount(Panel, {
      slots: { default: "x", footer: "<small id='ft' />" },
    });
    expect(wrapper.find("#ft").exists()).toBe(true);
  });
});
