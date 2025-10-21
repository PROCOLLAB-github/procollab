/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
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
  private readonly fb = inject(FormBuilder);

  readonly errorMessage = ErrorMessage;

  // Состояние для показа полей ввода
  public showInputFields = false;

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

  get achievementsDate() {
    return this.projectForm.get("achievementsDate");
  }

  get achievementsItems() {
    return this.projectAchievementService.achievementsItems;
  }

  get editIndex() {
    return this.projectFormService.editIndex;
  }

  /**
   * Проверяет, есть ли достижения для отображения
   */
  get hasAchievements(): boolean {
    return this.achievementsItems().length > 0 || this.achievements.length > 0;
  }

  /**
   * Показывает поля для ввода достижения
   */
  showFields(): void {
    this.showInputFields = true;
  }

  /**
   * Скрывает поля ввода и очищает их
   */
  hideFields(): void {
    this.showInputFields = false;
    this.clearInputFields();
  }

  /**
   * Очищает поля ввода
   */
  private clearInputFields(): void {
    this.projectForm.get("achievementsName")?.reset();
    this.projectForm.get("achievementsName")?.setValue("");

    if (this.editIndex() !== null) {
      this.projectFormService.editIndex.set(null);
    }
  }

  /**
   * Добавление достижения
   */
  addAchievement(id?: number, achievementsName?: string, achievementsDate?: string): void {
    const currentYear = new Date().getFullYear();
    this.achievements.push(
      this.fb.group({
        id: [id],
        title: [achievementsName ?? "", [Validators.required]],
        status: [
          achievementsDate ?? "",
          [
            Validators.required,
            Validators.min(2000),
            Validators.max(currentYear),
            Validators.pattern(/^\d{4}$/),
          ],
        ],
      })
    );

    this.projectAchievementService.addAchievement(this.achievements, this.projectForm);
  }

  /**
   * Редактирование достижения
   * @param index - индекс достижения
   */
  editAchievement(index: number): void {
    this.showInputFields = true;
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
