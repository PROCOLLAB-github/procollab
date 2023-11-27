/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramListRoutingModule } from "@office/program/list/list-routing.module";
import { ProgramMainComponent } from "./main/main.component";
import { ProgramModule } from "@office/program/program.module";

@NgModule({
    imports: [CommonModule, ProgramListRoutingModule, ProgramModule, ProgramMainComponent],
})
export class ProgramListModule {}
