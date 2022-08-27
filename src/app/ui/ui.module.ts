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
import { AvatarComponent } from "./components/avatar/avatar.component";
import { TagComponent } from "./components/tag/tag.component";

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    CheckboxComponent,
    IconComponent,
    SelectComponent,
    AvatarComponent,
    TagComponent,
  ],
  imports: [CommonModule, ClickOutsideModule, NgxMaskModule],
  exports: [
    ButtonComponent,
    InputComponent,
    CheckboxComponent,
    IconComponent,
    SelectComponent,
    AvatarComponent,
    TagComponent,
  ],
})
export class UiModule {}
