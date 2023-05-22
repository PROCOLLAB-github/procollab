/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProjectsRoutingModule } from "./projects-routing.module";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";
import { ProjectsComponent } from "./projects.component";
import { ProjectEditComponent } from "./edit/edit.component";
import { ProjectsListComponent } from "./list/list.component";
import { ReactiveFormsModule } from "@angular/forms";
import { InviteCardComponent } from "../shared/invite-card/invite-card.component";
import { VacancyCardComponent } from "../shared/vacancy-card/vacancy-card.component";
import { ProjectsFilterComponent } from "./projects-filter/projects-filter.component";
import { ProjectCardComponent } from "../shared/project-card/project-card.component";
import { VacancySendComponent } from "../vacancy/send/send.component";

@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectEditComponent,
    ProjectsListComponent,
    ProjectsFilterComponent,
    ProjectCardComponent,
    InviteCardComponent,
    VacancyCardComponent,
    VacancySendComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, CoreModule, UiModule, ProjectsRoutingModule],
  exports: [ProjectCardComponent],
})
export class ProjectsModule {}
