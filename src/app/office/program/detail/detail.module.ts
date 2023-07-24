/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramDetailRoutingModule } from "@office/program/detail/detail-routing.module";
import { ProgramDetailComponent } from "./detail/detail.component";
import { UiModule } from "@ui/ui.module";
import { ProgramDetailMainComponent } from "./main/main.component";
import { CoreModule } from "@core/core.module";
import { ProgramRegisterComponent } from "./register/register.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ProjectDetailModule } from "@office/projects/detail/detail.module";
import { ProgramNewsCardComponent } from "@office/program/shared/news-card/news-card.component";

@NgModule({
  declarations: [
    ProgramDetailComponent,
    ProgramDetailMainComponent,
    ProgramRegisterComponent,
    ProgramNewsCardComponent,
  ],
  imports: [
    CommonModule,
    ProgramDetailRoutingModule,
    UiModule,
    CoreModule,
    ReactiveFormsModule,
    ProjectDetailModule,
  ],
})
export class ProgramDetailModule {}
