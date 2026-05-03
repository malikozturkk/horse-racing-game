import { createPinia, setActivePinia, type Pinia } from "pinia";

export const installPinia = (): Pinia => {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
};
