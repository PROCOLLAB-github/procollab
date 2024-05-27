/** @format */

import { Routes } from "@angular/router";
import { ProfileHomeComponent } from "./profile-home.component";
import { SubscriptionPlansComponent } from "./subscription-plans/subscription-plans.component";
import { subscriptionPlansResolver } from "./subscription-plans/subscription-plans.resolver";
import { skillsListResolver } from "../../skills/list/list.resolver";
import { SkillChooserComponent } from "../shared/skill-chooser/skill-chooser.component";

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
        path: "skillPlans",
        component: SkillChooserComponent,
        resolve: {
          data: skillsListResolver
        }
      }
    ],
  },
];
