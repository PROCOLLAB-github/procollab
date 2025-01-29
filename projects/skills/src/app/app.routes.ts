/** @format */

import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "profile",
  },
  {
    path: "profile",
    loadChildren: () => import("./profile/profile.routes").then(c => c.PROFILE_ROUTES),
  },
  {
    path: "skills",
    loadChildren: () => import("./skills/skills.routes").then(c => c.SKILLS_ROUTES),
  },
  {
    path: "rating",
    loadChildren: () => import("./rating/rating.routes").then(c => c.RATING_ROUTES),
  },
  {
    path: "task",
    loadChildren: () => import("./task/task.routes").then(c => c.TASK_ROUTES),
  },
  {
    path: "subscription",
    loadChildren: () =>
      import("./subscription/subscription.routes").then(c => c.SUBSCRIPTION_ROUTES),
  },
  {
    path: "webinars",
    loadChildren: () => import("./webinars/webinars.routes").then(c => c.WEBINARS_ROUTES),
  },
];
