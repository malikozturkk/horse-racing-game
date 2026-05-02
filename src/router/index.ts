import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
} from "vue-router";

export const RouteName = {
  Home: "home",
  Barn: "barn",
  Preview: "preview",
} as const;

export type RouteNameValue = (typeof RouteName)[keyof typeof RouteName];

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/",
    name: RouteName.Home,
    component: () => import("../views/HorseRace.vue"),
    meta: { title: "Hipodrom" },
  },
  {
    path: "/barn",
    name: RouteName.Barn,
    component: () => import("../views/BarnView.vue"),
    meta: { title: "Ahır" },
  },
  {
    path: "/preview",
    name: RouteName.Preview,
    component: () => import("../components/Preview.vue"),
    meta: { title: "UI Showcase" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: RouteName.Home },
  },
];

export const createAppRouter = (): Router =>
  createRouter({
    history: createWebHistory(),
    routes: routes as RouteRecordRaw[],
    scrollBehavior: (_to, _from, savedPosition) =>
      savedPosition ?? { top: 0, behavior: "smooth" },
  });
