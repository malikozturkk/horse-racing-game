import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import EmptyHipodromCenter from "../../../src/components/race/EmptyHipodromCenter.vue";

describe("components/race/EmptyHipodromCenter", () => {
  it("renders the title and description", () => {
    const wrapper = mount(EmptyHipodromCenter);
    expect(wrapper.text()).toContain("Programı oluştur");
    expect(wrapper.text()).toContain("PROGRAM ÜRET");
  });

  it("emits 'generate' when the button is clicked", async () => {
    const wrapper = mount(EmptyHipodromCenter);
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("generate")).toHaveLength(1);
  });

  it("shows the spinner while busy", () => {
    const wrapper = mount(EmptyHipodromCenter, { props: { busy: true } });
    expect(wrapper.find(".btn__spinner").exists()).toBe(true);
  });
});
