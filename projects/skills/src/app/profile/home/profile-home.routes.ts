/** @format */

import { Routes } from "@angular/router";
import { ProfileHomeComponent } from "./profile-home.component";
import { SubscriptionPlansComponent } from "./subscription-plans/subscription-plans.component";
import { subscriptionPlansResolver } from "./subscription-plans/subscription-plans.resolver";
import { SkillChooserComponent } from "../skill-chooser/skill-chooser.component";
import { skillsListResolver } from "../../skills/list/list.resolver";

export const PROFILE_HOME_ROUTES: Routes = [
  {
    path: "",
    component: ProfileHomeComponent,
    children: [
      {
        path: "plans",
        component: SubscriptionPlansComponent,
        resolve: {
          data: subscriptionPlansResolver,
        },
      },
      {
        path: "skills",
        component: SkillChooserComponent,
        resolve: {
          data: skillsListResolver
        }
      }
    ],
  },
];
