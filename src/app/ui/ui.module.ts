/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent, CheckboxComponent, IconComponent, InputComponent } from "./components";

@NgModule({
  declarations: [ButtonComponent, InputComponent, CheckboxComponent, IconComponent],
  imports: [CommonModule],
  exports: [ButtonComponent, InputComponent, CheckboxComponent, IconComponent],
})
export class UiModule {}
