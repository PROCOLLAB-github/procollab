/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ButtonComponent,
  CheckboxComponent,
  ErrorMessageComponent,
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
    ErrorMessageComponent,
  ],
  imports: [CommonModule, ClickOutsideModule, NgxMaskModule],
  exports: [
    ButtonComponent,
    InputComponent,
    CheckboxComponent,
    IconComponent,
    SelectComponent,
    ErrorMessageComponent,
  ],
})
export class UiModule {}
