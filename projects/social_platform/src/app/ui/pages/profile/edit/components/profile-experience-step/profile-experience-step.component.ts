/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input, Input } from "@angular/core";
import { SelectComponent, InputComponent, ButtonComponent } from "@ui/primitives";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ProfileFormService } from "@api/profile/facades/edit/profile-form.service";
import { ReactiveFormsModule } from "@angular/forms";
import { ProfileEditExperienceInfoService } from "@api/profile/facades/edit/profile-edit-experience-info.service";
import { IconComponent } from "@uilib";
import { TruncatePipe, ControlErrorPipe } from "@corelib";

/** Шаг редактирования профиля: опыт работы. */
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
    TruncatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileExperienceStepComponent {
  readonly isWorkDirty = input.required<boolean>();

  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditExperienceInfoService = inject(ProfileEditExperienceInfoService);

  protected readonly profileForm = this.profileFormService.getForm();
  protected readonly workExperience = this.profileFormService.workExperience;
  protected readonly workItems = this.profileEditExperienceInfoService.workItems;

  protected readonly yearListEducation = this.profileFormService.yearListEducation;
  protected readonly yearListEducationWithPresent =
    this.profileFormService.yearListEducationWithPresent;

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
