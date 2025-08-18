/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { FormArray, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputComponent, ButtonComponent } from "@ui/components";
import { LinkCardComponent } from "@office/shared/link-card/link-card.component";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@error/models/error-message";
import { ProjectFormService } from "../../services/project-form.service";
import { ProjectAchievementsService } from "../../services/project-achievements.service";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-project-achievement-step",
  templateUrl: "./project-achievement-step.component.html",
  styleUrl: "./project-achievement-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    IconComponent,
    LinkCardComponent,
    ControlErrorPipe,
  ],
})
export class ProjectAchievementStepComponent {
  @Input() projSubmitInitiated = false;

  private readonly projectAchievementService = inject(ProjectAchievementsService);
  private readonly projectFormService = inject(ProjectFormService);

  readonly errorMessage = ErrorMessage;

  // Получаем форму из сервиса
  get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  // Геттеры для FormArray и полей
  get achievements(): FormArray {
    return this.projectFormService.achievements;
  }

  get achievementsName() {
    return this.projectForm.get("achievementsName");
  }

  get achievementsPrize() {
    return this.projectForm.get("achievementsPrize");
  }

  get achievementsItems() {
    return this.projectAchievementService.achievementsItems;
  }

  get editIndex() {
    return this.projectFormService.editIndex;
  }

  /**
   * Добавление достижения
   */
  addAchievement(): void {
    this.projectAchievementService.addAchievement(this.achievements, this.projectForm);
  }

  /**
   * Редактирование достижения
   * @param index - индекс достижения
   */
  editAchievement(index: number): void {
    this.projectAchievementService.editAchievement(index, this.achievements, this.projectForm);
  }

  /**
   * Удаление достижения
   * @param index - индекс достижения
   */
  removeAchievement(index: number): void {
    this.projectAchievementService.removeAchievement(index, this.achievements);
  }
}
