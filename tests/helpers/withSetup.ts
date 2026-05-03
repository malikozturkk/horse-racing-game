import { createApp, defineComponent, h } from "vue";
import type { App } from "vue";
import { installPinia } from "./pinia";

export interface SetupResult<T> {
  readonly result: T;
  readonly app: App;
  unmount(): void;
}

export const withSetup = <T>(setup: () => T): SetupResult<T> => {
  installPinia();
  let captured: T | undefined;
  const Wrapper = defineComponent({
    name: "WithSetupWrapper",
    setup() {
      captured = setup();
      return () => h("div");
    },
  });
  const root = document.createElement("div");
  const app = createApp(Wrapper);
  app.mount(root);
  return {
    result: captured as T,
    app,
    unmount(): void {
      app.unmount();
    },
  };
};
