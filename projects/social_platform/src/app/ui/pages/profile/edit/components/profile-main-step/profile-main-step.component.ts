/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Output, EventEmitter } from "@angular/core";
import { InputComponent, ButtonComponent, SelectComponent } from "@ui/components";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { AutosizeModule } from "ngx-autosize";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ProfileFormService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-form.service";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchesService } from "projects/social_platform/src/app/api/searches/searches.service";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-profile-main-step",
  templateUrl: "./profile-main-step.component.html",
  styleUrl: "./profile-main-step.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    InputComponent,
    ButtonComponent,
    TextareaComponent,
    AutosizeModule,
    AutoCompleteInputComponent,
    SelectComponent,
    UploadFileComponent,
    AvatarControlComponent,
    ControlErrorPipe,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class ProfileMainStepComponent {
  @Output() openSpecsGroupsModal = new EventEmitter<void>();

  private readonly profileFormService = inject(ProfileFormService);
  private readonly searchesService = inject(SearchesService);

  protected readonly profileForm = this.profileFormService.getForm();

  protected readonly avatar = this.profileFormService.avatar;
  protected readonly coverImageAddress = this.profileFormService.coverImageAddress;
  protected readonly firstName = this.profileFormService.firstName;
  protected readonly lastName = this.profileFormService.lastName;
  protected readonly city = this.profileFormService.city;
  protected readonly birthday = this.profileFormService.birthday;
  protected readonly userType = this.profileFormService.userType;
  protected readonly speciality = this.profileFormService.speciality;
  protected readonly aboutMe = this.profileFormService.aboutMe;
  protected readonly phoneNumber = this.profileFormService.phoneNumber;

  protected readonly roles = this.profileFormService.roles;
  protected readonly inlineSpecs = this.profileFormService.inlineSpecs;

  protected readonly links = this.profileFormService.links;

  protected readonly errorMessage = ErrorMessage;

  protected addLink(title?: string): void {
    this.profileFormService.addLink(title);
  }

  protected removeLink(index: number): void {
    this.profileFormService.removeLink(index);
  }

  protected onSearchSpec(query: string): void {
    this.searchesService.onSearchSpec(query);
  }

  protected toggleSpecsGroupsModal(): void {
    this.openSpecsGroupsModal.emit();
  }
}
