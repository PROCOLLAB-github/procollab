/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { SelectComponent, InputComponent, ButtonComponent } from "@ui/components";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ProfileFormService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-form.service";
import { ControlErrorPipe } from "@corelib";
import { ReactiveFormsModule } from "@angular/forms";
import { ProfileEditExperienceInfoService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-edit-experience-info.service";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-profile-experience-step",
  templateUrl: "./profile-experience-step.component.html",
  styleUrl: "./profile-experience-step.component.scss",
  imports: [
    CommonModule,
    SelectComponent,
    InputComponent,
    IconComponent,
    TextareaComponent,
    ButtonComponent,
    ControlErrorPipe,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class ProfileExperienceStepComponent {
  @Input() isWorkDirty: any;

  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditExperienceInfoService = inject(ProfileEditExperienceInfoService);

  protected readonly profileForm = this.profileFormService.getForm();
  protected readonly workExperience = this.profileFormService.workExperience;
  protected readonly workItems = this.profileEditExperienceInfoService.workItems;

  protected readonly yearListEducation = this.profileFormService.yearListEducation;

  protected readonly showWorkFields = this.profileEditExperienceInfoService.showWorkFields;
  protected readonly editWorkClick = this.profileEditExperienceInfoService.editWorkClick;

  protected readonly selectedEntryYearWorkId =
    this.profileEditExperienceInfoService.selectedEntryYearWorkId;

  protected readonly selectedComplitionYearWorkId =
    this.profileEditExperienceInfoService.selectedComplitionYearWorkId;

  protected readonly errorMessage = ErrorMessage;

  addWork(): void {
    this.profileEditExperienceInfoService.addWork();
  }

  editWork(index: number): void {
    this.profileEditExperienceInfoService.editWork(index);
  }

  removeWork(index: number): void {
    this.profileEditExperienceInfoService.removeWork(index);
  }
}
