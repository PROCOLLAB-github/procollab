/** @format */

import { SkillChooserComponent } from "./skill-chooser.component";
import { skillChooserResolver } from "./skill-chooser.resolver";

export const SKILL_CHOOSER_ROUTES = [
  {
    path: "",
    component: SkillChooserComponent,
    resolve: {
      data: skillChooserResolver,
    },
  },
];
