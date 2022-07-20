/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ButtonComponent,
  CheckboxComponent,
  IconComponent,
  InputComponent,
  SelectComponent,
} from "./components";
import { ClickOutsideModule } from "ng-click-outside";
import { NgxMaskModule } from "ngx-mask";

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    CheckboxComponent,
    IconComponent,
    SelectComponent,
  ],
  imports: [CommonModule, ClickOutsideModule, NgxMaskModule],
  exports: [ButtonComponent, InputComponent, CheckboxComponent, IconComponent, SelectComponent],
})
export class UiModule {}
