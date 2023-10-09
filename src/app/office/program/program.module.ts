/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramRoutingModule } from "@office/program/program-routing.module";
import { ProgramCardComponent } from "./shared/program-card/program-card.component";
import { UiModule } from "@ui/ui.module";
import { CoreModule } from "@core/core.module";
import { ProgramHeadComponent } from "./shared/program-head/program-head.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [ProgramCardComponent, ProgramHeadComponent],
  imports: [ProgramRoutingModule, CommonModule, UiModule, CoreModule, FormsModule],
  exports: [ProgramCardComponent, ProgramHeadComponent],
})
export class ProgramModule {}
