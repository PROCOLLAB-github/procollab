/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "./components/button/button.component";
import { InputComponent } from "./components/input/input.component";
import { CheckboxComponent } from "./components/checkbox/checkbox.component";

@NgModule({
  declarations: [ButtonComponent, InputComponent, CheckboxComponent],
  imports: [CommonModule],
  exports: [ButtonComponent, InputComponent, CheckboxComponent],
})
export class UiModule {}
