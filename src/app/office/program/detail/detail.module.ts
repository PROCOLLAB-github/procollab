/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramDetailRoutingModule } from "@office/program/detail/detail-routing.module";
import { ProgramDetailComponent } from "./detail/detail.component";
import { RouterModule } from "@angular/router";
import { UiModule } from "@ui/ui.module";

@NgModule({
  declarations: [ProgramDetailComponent],
  imports: [CommonModule, ProgramDetailRoutingModule, UiModule],
})
export class ProgramDetailModule {}
