import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { createAppRouter } from "./router";
import { setServices } from "./infrastructure/container";
import { seededRng } from "./domain/shared/rng";

const seedParam = new URL(window.location.href).searchParams.get("seed");
if (seedParam !== null) {
  const seed = Number.parseInt(seedParam, 10);
  if (Number.isFinite(seed)) {
    setServices({ rng: seededRng(seed) });
  }
}

const app = createApp(App);
app.use(createPinia());
app.use(createAppRouter());
app.mount("#app");
