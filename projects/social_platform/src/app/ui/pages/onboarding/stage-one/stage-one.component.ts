/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ButtonComponent } from "@ui/components";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SpecializationsGroupComponent } from "@ui/shared/specializations-group/specializations-group.component";
import { Specialization } from "projects/social_platform/src/app/domain/specializations/specialization";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { OnboardingStageOneUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-stage-one-ui-info.service";
import { OnboardingStageOneInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/onboarding-stage-one-info.service";
import { OnboardingUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-ui-info.service";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";

/**
 * КОМПОНЕНТ ПЕРВОГО ЭТАПА ОНБОРДИНГА
 *
 * Назначение: Этап выбора специализации пользователя из предложенных вариантов
 *
 * Что делает:
 * - Отображает форму для ввода/выбора специализации
 * - Предоставляет автокомплит для поиска специализаций
 * - Показывает группированные специализации из базы данных
 * - Валидирует введенные данные
 * - Сохраняет специализацию в профиле и переходит к следующему этапу
 * - Предоставляет возможность пропустить этап
 *
 * Что принимает:
 * - Данные специализаций через ActivatedRoute (из StageOneResolver)
 * - Текущее состояние формы из OnboardingService
 * - Пользовательский ввод в поле специализации
 * - Поисковые запросы для автокомплита
 *
 * Что возвращает:
 * - Интерфейс с полем ввода специализации
 * - Список предложенных специализаций для выбора
 * - Навигацию на следующий этап (stage-2) или финальный (stage-3)
 *
 * Особенности:
 * - Использует сигналы Angular для реактивного состояния
 * - Поддерживает поиск специализаций в реальном времени
 * - Интегрирован с сервисом специализаций для получения данных
 */
@Component({
  selector: "app-stage-one",
  templateUrl: "./stage-one.component.html",
  styleUrl: "./stage-one.component.scss",
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SpecializationsGroupComponent,
    CommonModule,
    TooltipComponent,
  ],
  providers: [
    OnboardingStageOneInfoService,
    OnboardingStageOneUIInfoService,
    OnboardingUIInfoService,
    TooltipInfoService,
  ],
  standalone: true,
})
export class OnboardingStageOneComponent implements OnInit, OnDestroy {
  private readonly onboardingStageOneInfoService = inject(OnboardingStageOneInfoService);
  private readonly onboardingStageOneUIInfoService = inject(OnboardingStageOneUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  protected readonly stageForm = this.onboardingStageOneUIInfoService.stageForm;

  protected readonly isHintAuthVisible = this.tooltipInfoService.isHintAuthVisible;
  protected readonly isHintLibVisible = this.tooltipInfoService.isHintLibVisible;

  protected readonly inlineSpecializations =
    this.onboardingStageOneInfoService.inlineSpecializations;

  protected readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  protected readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

  // Для управления открытыми группами специализаций
  protected readonly openSpecializationGroup =
    this.onboardingStageOneUIInfoService.openSpecializationGroup;

  protected readonly nestedSpecializations$ =
    this.onboardingStageOneInfoService.nestedSpecializations$;

  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.onboardingStageOneInfoService.initializationFormValues();
  }

  ngAfterViewInit(): void {
    this.onboardingStageOneInfoService.initializationSpeciality();
  }

  ngOnDestroy(): void {
    this.onboardingStageOneInfoService.destroy();
  }

  toggleTooltip(option: "show" | "hide", type: "auth" | "lib"): void {
    option === "show"
      ? this.tooltipInfoService.showTooltip(type)
      : this.tooltipInfoService.hideTooltip(type);
  }

  /**
   * Проверяет, есть ли открытые группы специализаций
   */
  protected readonly hasOpenSpecializationsGroups =
    this.onboardingStageOneUIInfoService.hasOpenSpecializationsGroups;

  /**
   * Обработчик переключения группы специализаций
   * @param isOpen - флаг открытия/закрытия группы
   * @param groupName - название группы
   */
  onSpecializationsGroupToggled(isOpen: boolean, groupName: string): void {
    this.onboardingStageOneUIInfoService.onSpecializationsGroupToggled(isOpen, groupName);
  }

  /**
   * Проверяет, должна ли группа специализаций быть отключена
   * @param groupName - название группы для проверки
   */
  isSpecializationGroupDisabled(groupName: string): boolean {
    return this.onboardingStageOneUIInfoService.isSpecializationGroupDisabled(groupName);
  }

  onSkipRegistration(): void {
    this.onboardingStageOneInfoService.onSkipRegistration();
  }

  onSubmit(): void {
    this.onboardingStageOneInfoService.onSubmit();
  }

  onSelectSpec(speciality: Specialization): void {
    this.onboardingStageOneInfoService.onSelectSpec(speciality);
  }

  onSearchSpec(query: string): void {
    this.onboardingStageOneInfoService.onSearchSpec(query);
  }
}
