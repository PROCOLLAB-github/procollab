/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, Output, EventEmitter } from "@angular/core";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SkillsBasketComponent } from "@ui/shared/skills-basket/skills-basket.component";
import { SelectComponent, ButtonComponent } from "@ui/components";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ProfileFormService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-form.service";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ProfileEditSkillsInfoService } from "projects/social_platform/src/app/api/profile/facades/edit/profile-edit-skills-info.service";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { SkillsInfoService } from "projects/social_platform/src/app/api/skills/facades/skills-info.service";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-profile-skills-step",
  templateUrl: "./profile-skills-step.component.html",
  styleUrl: "./profile-skills-step.component.scss",
  imports: [
    CommonModule,
    AutoCompleteInputComponent,
    SkillsBasketComponent,
    SelectComponent,
    ButtonComponent,
    ReactiveFormsModule,
    ControlErrorPipe,
    IconComponent,
  ],
  standalone: true,
})
export class ProfileSkillsStepComponent {
  @Input() isLanguageDirty: any;

  @Output() openSkillsGroupsModal = new EventEmitter<void>();

  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditSkillsInfoService = inject(ProfileEditSkillsInfoService);
  private readonly skillsInfoService = inject(SkillsInfoService);

  protected readonly profileForm = this.profileFormService.getForm();
  protected readonly languageItems = this.profileEditSkillsInfoService.languageItems;
  protected readonly userLanguages = this.profileFormService.userLanguages;

  protected readonly languageList = this.profileFormService.languageList;
  protected readonly languageLevelList = this.profileFormService.languageLevelList;

  protected readonly showLanguageFields = this.profileEditSkillsInfoService.showLanguageFields;
  protected readonly editLanguageClick = this.profileEditSkillsInfoService.editLanguageClick;

  protected readonly selectedLanguageLevelId =
    this.profileEditSkillsInfoService.selectedLanguageLevelId;

  protected readonly selectedLanguageId = this.profileEditSkillsInfoService.selectedLanguageId;

  protected readonly inlineSkills = this.skillsInfoService.inlineSkills;

  protected readonly errorMessage = ErrorMessage;

  protected addLanguage(): void {
    this.profileEditSkillsInfoService.addLanguage();
  }

  protected editLanguage(index: number): void {
    this.profileEditSkillsInfoService.editLanguage(index);
  }

  protected removeLanguage(index: number): void {
    this.profileEditSkillsInfoService.removeLanguage(index);
  }

  /**
   * Переключение навыка (добавление/удаление)
   * @param toggledSkill - навык для переключения
   */
  protected onToggleSkill(toggledSkill: Skill): void {
    this.skillsInfoService.onToggleSkill(toggledSkill, this.profileForm);
  }

  /**
   * Добавление нового навыка
   * @param newSkill - новый навык для добавления
   */
  protected onAddSkill(newSkill: Skill): void {
    this.skillsInfoService.onAddSkill(newSkill, this.profileForm);
  }

  protected toggleSkillsGroupsModal(): void {
    this.openSkillsGroupsModal.emit();
  }

  protected onSearchSkill(query: string): void {
    this.skillsInfoService.onSearchSkill(query);
  }
}
