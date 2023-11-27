/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramCardComponent } from "./shared/program-card/program-card.component";
import { UiModule } from "@ui/ui.module";
import { CoreModule } from "@core/core.module";
import { ProgramHeadComponent } from "./shared/program-head/program-head.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    UiModule,
    CoreModule,
    FormsModule,
    ProgramCardComponent,
    ProgramHeadComponent,
  ],
  exports: [ProgramCardComponent, ProgramHeadComponent],
})
export class ProgramModule {}
