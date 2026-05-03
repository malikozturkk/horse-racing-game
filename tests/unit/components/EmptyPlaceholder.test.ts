import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import EmptyPlaceholder from "../../../src/components/race/EmptyPlaceholder.vue";

describe("components/race/EmptyPlaceholder", () => {
  it("renders title, icon and message", () => {
    const wrapper = mount(EmptyPlaceholder, {
      props: { title: "Sonuçlar", icon: "🏆", message: "Boş" },
    });
    expect(wrapper.text()).toContain("🏆");
    expect(wrapper.text()).toContain("Sonuçlar");
    expect(wrapper.text()).toContain("Boş");
  });

  it("supports tone variants", () => {
    const wrapper = mount(EmptyPlaceholder, {
      props: {
        title: "Program",
        icon: "📋",
        message: "Üret",
        tone: "gold",
      },
    });
    const panel = wrapper.find(".panel");
    expect(panel.classes()).toContain("panel--gold");
  });
});
