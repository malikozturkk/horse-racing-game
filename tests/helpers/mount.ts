import { mount, type ComponentMountingOptions } from "@vue/test-utils";
import type { Component } from "vue";
import { installPinia } from "./pinia";

export const mountWithPinia = <C extends Component>(
  component: C,
  options: ComponentMountingOptions<C> = {} as ComponentMountingOptions<C>
) => {
  installPinia();
  return mount(component, options);
};
