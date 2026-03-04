/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputComponent, ButtonComponent } from "@ui/components";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ProjectFormService } from "../../../../../../api/project/facades/edit/project-form.service";
import { IconComponent } from "@uilib";
import { ProjectAchievementsService } from "projects/social_platform/src/app/api/project/facades/edit/project-achievements.service";
import { ToggleFieldsInfoService } from "projects/social_platform/src/app/api/toggle-fields/toggle-fields-info.service";

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
    ControlErrorPipe,
  ],
  providers: [ToggleFieldsInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectAchievementStepComponent implements OnInit {
  @Input() projSubmitInitiated = false;

  private readonly projectAchievementService = inject(ProjectAchievementsService);
  private readonly toggleFieldsInfoService = inject(ToggleFieldsInfoService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  // Получаем форму из сервиса
  protected readonly projectForm = this.projectFormService.getForm();

  // Состояние для показа полей ввода
  protected readonly showInputFields = this.toggleFieldsInfoService.showInputFields;

  // Геттеры для FormArray и полей
  protected readonly achievements = this.projectFormService.achievements;
  protected readonly achievementsItems = this.projectAchievementService.achievementsItems;

  protected readonly editIndex = this.projectFormService.editIndex;

  /**
   * Проверяет, есть ли достижения для отображения
   */
  protected readonly hasAchievements = this.projectAchievementService.hasAchievements;

  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.projectAchievementService.syncAchievementsItems(this.achievements);
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

    this.projectAchievementService.addAchievement(this.achievements);
  }

  /**
   * Редактирование достижения
   * @param index - индекс достижения
   */
  editAchievement(index: number): void {
    this.toggleFieldsInfoService.showFields();
    this.projectAchievementService.editAchievement(index, this.achievements);
  }

  /**
   * Удаление достижения
   * @param index - индекс достижения
   */
  removeAchievement(index: number): void {
    this.projectAchievementService.removeAchievement(index, this.achievements);
  }
}
