/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramDetailRoutingModule } from "@office/program/detail/detail-routing.module";
import { ProgramDetailComponent } from "./detail/detail.component";
import { UiModule } from "@ui/ui.module";
import { ProgramDetailMainComponent } from "./main/main.component";
import { CoreModule } from "@core/core.module";

@NgModule({
  declarations: [ProgramDetailComponent, ProgramDetailMainComponent],
  imports: [CommonModule, ProgramDetailRoutingModule, UiModule, CoreModule],
})
export class ProgramDetailModule {}
