/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramRoutingModule } from "@office/program/program-routing.module";
import { ProgramCardComponent } from "./shared/program-card/program-card.component";
import { UiModule } from "@ui/ui.module";
import { CoreModule } from "@core/core.module";

@NgModule({
  declarations: [ProgramCardComponent],
  imports: [ProgramRoutingModule, CommonModule, UiModule, CoreModule],
  exports: [ProgramCardComponent],
})
export class ProgramModule {}
