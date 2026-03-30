/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { InputComponent, SelectComponent, ButtonComponent } from "@ui/primitives";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { UploadFileComponent } from "@ui/primitives/upload-file/upload-file.component";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ProfileFormService } from "@api/profile/facades/edit/profile-form.service";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ProfileEditAchievementsInfoService } from "@api/profile/facades/edit/profile-edit-achievements-info.service";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-profile-achievements-step",
  templateUrl: "./profile-achievements-step.component.html",
  styleUrl: "./profile-achievements-step.component.scss",
  imports: [
    CommonModule,
    InputComponent,
    IconComponent,
    SelectComponent,
    TextareaComponent,
    UploadFileComponent,
    ButtonComponent,
    FileItemComponent,
    ReactiveFormsModule,
    ControlErrorPipe,
  ],
  providers: [ProfileEditAchievementsInfoService],
  standalone: true,
})
export class ProfileAchievementsStepComponent {
  @Input() isAchievementsDirty!: boolean;
  protected readonly errorMessage = ErrorMessage;

  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditAchievementsInfoService = inject(ProfileEditAchievementsInfoService);

  protected readonly profileForm = this.profileFormService.getForm();
  protected readonly achievementItems = this.profileEditAchievementsInfoService.achievementItems;
  protected readonly achievements = this.profileFormService.achievements;

  protected readonly achievementsYearList = this.profileFormService.achievementsYearList;

  protected readonly showAchievementsFields =
    this.profileEditAchievementsInfoService.showAchievementsFields;

  protected readonly editAchievementsClick =
    this.profileEditAchievementsInfoService.editAchievementsClick;

  protected readonly selectedAchievementsYearId =
    this.profileEditAchievementsInfoService.selectedAchievementsYearId;

  protected isStringFiles(files: any[]): boolean {
    return typeof files === "string";
  }

  protected addAchievement(): void {
    this.profileEditAchievementsInfoService.addAchievement();
  }

  protected editAchievements(index: number): void {
    this.profileEditAchievementsInfoService.editAchievements(index);
  }

  protected removeAchievement(index: number): void {
    this.profileEditAchievementsInfoService.removeAchievement(index);
  }
}
