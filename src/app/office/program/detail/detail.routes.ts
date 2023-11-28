/** @format */

import { Routes } from "@angular/router";
import { ProgramDetailComponent } from "@office/program/detail/detail/detail.component";
import { ProgramDetailResolver } from "@office/program/detail/detail/detail.resolver";
import { ProgramDetailMainComponent } from "@office/program/detail/main/main.component";
import { ProgramRegisterComponent } from "@office/program/detail/register/register.component";
import { ProgramRegisterResolver } from "@office/program/detail/register/register.resolver";
import { ProgramProjectsComponent } from "@office/program/detail/projects/projects.component";
import { ProgramProjectsResolver } from "@office/program/detail/projects/projects.resolver";
import { ProgramMembersComponent } from "@office/program/detail/members/members.component";
import { ProgramMembersResolver } from "@office/program/detail/members/members.resolver";

export const PROGRAM_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: ProgramDetailComponent,
    resolve: {
      data: ProgramDetailResolver,
    },
    children: [
      {
        path: "",
        component: ProgramDetailMainComponent,
      },
      {
        path: "projects",
        component: ProgramProjectsComponent,
        resolve: {
          data: ProgramProjectsResolver,
        },
      },
      {
        path: "members",
        component: ProgramMembersComponent,
        resolve: {
          data: ProgramMembersResolver,
        },
      },
    ],
  },
  {
    path: "register",
    component: ProgramRegisterComponent,
    resolve: {
      data: ProgramRegisterResolver,
    },
  },
];
