/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OfficeRoutingModule } from "./office-routing.module";
import { OfficeComponent } from "./office.component";

@NgModule({
  declarations: [OfficeComponent],
  imports: [OfficeRoutingModule, CommonModule],
})
export class OfficeModule {}
