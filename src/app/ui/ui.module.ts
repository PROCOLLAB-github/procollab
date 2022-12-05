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
import { LoaderComponent } from "./components/loader/loader.component";
import { ModalComponent } from "./components/modal/modal.component";
import { AvatarControlComponent } from "./components/avatar-control/avatar-control.component";
import { UploadFileComponent } from "./components/upload-file/upload-file.component";
import { SearchComponent } from "./components/search/search.component";
import { NumSliderComponent } from "./components/num-slider/num-slider.component";

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
    LoaderComponent,
    ModalComponent,
    AvatarControlComponent,
    UploadFileComponent,
    SearchComponent,
    NumSliderComponent,
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
    ModalComponent,
    AvatarControlComponent,
    UploadFileComponent,
    SearchComponent,
    NumSliderComponent,
  ],
})
export class UiModule {}
