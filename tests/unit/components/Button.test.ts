import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Button from "../../../src/components/ui/Button.vue";

describe("components/ui/Button", () => {
  it("renders the default slot", () => {
    const wrapper = mount(Button, { slots: { default: "Save" } });
    expect(wrapper.text()).toContain("Save");
  });

  it("emits 'button-click' when clicked", async () => {
    const wrapper = mount(Button, { slots: { default: "Save" } });
    await wrapper.trigger("click");
    expect(wrapper.emitted("button-click")).toHaveLength(1);
  });

  it("does not emit when disabled", async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: "Save" },
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("button-click")).toBeUndefined();
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });

  it("does not emit when loading and shows the spinner", async () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: "Save" },
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("button-click")).toBeUndefined();
    expect(wrapper.find(".btn__spinner").exists()).toBe(true);
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });

  it("applies the variant + size class names", () => {
    const wrapper = mount(Button, {
      props: { variant: "danger", size: "lg" },
      slots: { default: "Bye" },
    });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["btn", "btn--lg", "btn--danger"])
    );
  });

  it("uses block layout when block=true", () => {
    const wrapper = mount(Button, {
      props: { block: true },
      slots: { default: "Wide" },
    });
    expect(wrapper.classes()).toContain("w-full");
  });

  it("renders the leading slot when not loading", () => {
    const wrapper = mount(Button, {
      slots: { default: "Save", leading: "<svg id='icon' />" },
    });
    expect(wrapper.find("#icon").exists()).toBe(true);
  });

  it("hides the leading slot while loading", () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: "Save", leading: "<svg id='icon' />" },
    });
    expect(wrapper.find("#icon").exists()).toBe(false);
  });
});
