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
import { LoaderComponent } from "./components/loader/loader.component";
import { ModalComponent } from "./components/modal/modal.component";
import { AvatarControlComponent } from "./components/avatar-control/avatar-control.component";
import { UploadFileComponent } from "./components/upload-file/upload-file.component";
import { SearchComponent } from "./components/search/search.component";
import { NumSliderComponent } from "./components/num-slider/num-slider.component";
import { SwitchComponent } from "./components/switch/switch.component";
import { EditorSubmitButtonDirective } from "./directives/editor-submit-button.directive";
import { ChatMessageComponent } from "./components/chat-message/chat-message.component";
import { ProfileInfoComponent } from "./components/profile-info/profile-info.component";
import { CoreModule } from "@core/core.module";
import { RouterModule } from "@angular/router";
import { FileItemComponent } from "./components/file-item/file-item.component";
import { AutosizeModule } from "ngx-autosize";
import { SnackbarComponent } from "./components/snackbar/snackbar.component";
import { DeleteConfirmComponent } from "./components/delete-confirm/delete-confirm.component";
import { PortalModule } from "@angular/cdk/portal";
import { OverlayModule } from "@angular/cdk/overlay";
import { FileTypePipe } from "./pipes/file-type.pipe";
import { BackComponent } from "./components/back/back.component";

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
    SwitchComponent,
    EditorSubmitButtonDirective,
    ChatMessageComponent,
    ProfileInfoComponent,
    FileItemComponent,
    SnackbarComponent,
    DeleteConfirmComponent,
    FileTypePipe,
    BackComponent,
  ],
  imports: [
    CommonModule,
    ClickOutsideModule,
    NgxMaskModule,
    CoreModule,
    RouterModule,
    AutosizeModule,
    PortalModule,
    OverlayModule,
  ],
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
    SwitchComponent,
    EditorSubmitButtonDirective,
    ChatMessageComponent,
    ProfileInfoComponent,
    FileItemComponent,
    SnackbarComponent,
    DeleteConfirmComponent,
    BackComponent,
    FileTypePipe,
  ],
})
export class UiModule {}
