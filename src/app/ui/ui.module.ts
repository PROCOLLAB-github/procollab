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
import { TextareaComponent } from "./components/textarea/textarea.component";
import { NgxAutogrowModule } from "ngx-autogrow";

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    CheckboxComponent,
    IconComponent,
    SelectComponent,
    AvatarComponent,
    TagComponent,
    TextareaComponent,
  ],
  imports: [CommonModule, ClickOutsideModule, NgxMaskModule, NgxAutogrowModule],
  exports: [
    ButtonComponent,
    InputComponent,
    TextareaComponent,
    CheckboxComponent,
    IconComponent,
    SelectComponent,
    AvatarComponent,
    TagComponent,
  ],
})
export class UiModule {}
