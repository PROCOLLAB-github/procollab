/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { IconComponent } from "@uilib";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { SelectComponent, ButtonComponent, InputComponent } from "@ui/components";
import { ProfileFormService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-form.service";
import { ProfileEditEducationInfoService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-edit-education-info.service";
import { ProfileDetailUIInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/ui/profile-detail-ui-info.service";

@Component({
  selector: "app-profile-education-step",
  templateUrl: "./profile-education-step.component.html",
  styleUrl: "./profile-education-step.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    SelectComponent,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule,
    ControlErrorPipe,
  ],
  providers: [ProfileDetailUIInfoService],
  standalone: true,
})
export class ProfileEducationStepComponent {
  @Input() isEducationDirty: any;

  protected readonly errorMessage = ErrorMessage;

  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditEducationInfoService = inject(ProfileEditEducationInfoService);

  protected readonly profileForm = this.profileFormService.getForm();
  protected readonly education = this.profileFormService.education;
  protected readonly educationItems = this.profileEditEducationInfoService.educationItems;

  protected readonly yearListEducation = this.profileFormService.yearListEducation;
  protected readonly educationLevelList = this.profileFormService.educationLevelList;
  protected readonly educationStatusList = this.profileFormService.educationStatusList;

  protected readonly showEducationFields = this.profileEditEducationInfoService.showEducationFields;
  protected readonly editEducationClick = this.profileEditEducationInfoService.editEducationClick;

  protected readonly selectedEntryYearEducationId =
    this.profileEditEducationInfoService.selectedEntryYearEducationId;

  protected readonly selectedComplitionYearEducationId =
    this.profileEditEducationInfoService.selectedComplitionYearEducationId;

  protected readonly selectedEducationLevelId =
    this.profileEditEducationInfoService.selectedEducationLevelId;

  protected readonly selectedEducationStatusId =
    this.profileEditEducationInfoService.selectedEducationStatusId;

  protected addEducation(): void {
    this.profileEditEducationInfoService.addEducation();
  }

  protected editEducation(index: number): void {
    this.profileEditEducationInfoService.editEducation(index);
  }

  protected removeEducation(index: number): void {
    this.profileEditEducationInfoService.removeEducation(index);
  }
}
