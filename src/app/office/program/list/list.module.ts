/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramMainComponent } from "./main/main.component";
import { ProgramModule } from "@office/program/program.module";

@NgModule({
  imports: [CommonModule, ProgramModule, ProgramMainComponent],
})
export class ProgramListModule {}
