/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OfficeRoutingModule } from "./office-routing.module";
import { OfficeComponent } from "./office.component";
import { HeaderComponent } from "./shared/header/header.component";
import { UiModule } from "../ui/ui.module";

@NgModule({
  declarations: [OfficeComponent, HeaderComponent],
  imports: [OfficeRoutingModule, CommonModule, UiModule],
})
export class OfficeModule {}
