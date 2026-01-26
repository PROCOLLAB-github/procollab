/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ButtonComponent, IconComponent } from "@ui/components";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SkillsGroupComponent } from "@ui/shared/skills-group/skills-group.component";
import { SkillsBasketComponent } from "@ui/shared/skills-basket/skills-basket.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { SkillsService } from "projects/social_platform/src/app/api/skills/skills.service";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { OnboardingUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-ui-info.service";
import { OnboardingStageTwoUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-stage-two-ui-info.service";
import { OnboardingStageTwoInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/onboarding-stage-two-info.service";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";

/**
 * КОМПОНЕНТ ВТОРОГО ЭТАПА ОНБОРДИНГА
 *
 * Назначение: Этап выбора навыков пользователя из каталога доступных навыков
 *
 * Что делает:
 * - Отображает интерфейс для поиска и выбора навыков
 * - Управляет корзиной выбранных навыков
 * - Предоставляет группированный каталог навыков
 * - Поддерживает поиск навыков в реальном времени
 * - Валидирует выбранные навыки перед отправкой
 * - Сохраняет навыки в профиле и переходит к следующему этапу
 * - Обрабатывает ошибки валидации от сервера
 *
 * Что принимает:
 * - Данные групп навыков через ActivatedRoute (из StageTwoResolver)
 * - Текущее состояние формы из OnboardingService
 * - Пользовательские действия (поиск, добавление/удаление навыков)
 * - Результаты поиска от SkillsService
 *
 * Что возвращает:
 * - Интерфейс с поиском навыков и автокомплитом
 * - Группированный каталог навыков для выбора
 * - Корзину выбранных навыков с возможностью удаления
 * - Модальное окно с ошибками валидации
 * - Навигацию на следующий этап (stage-3)
 *
 * Особенности работы с навыками:
 * - Предотвращение дублирования навыков в корзине
 * - Переключение состояния навыка (добавить/удалить) одним действием
 * - Отправка только ID навыков на сервер (skillsIds)
 * - Обработка серверных ошибок с отображением в модальном окне
 *
 * Состояния компонента:
 * - searchedSkills: результаты поиска навыков
 * - stageSubmitting: флаг процесса отправки
 * - isChooseSkill: флаг отображения модального окна с ошибкой
 */
@Component({
  selector: "app-stage-two",
  templateUrl: "./stage-two.component.html",
  styleUrl: "./stage-two.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    ModalComponent,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SkillsGroupComponent,
    SkillsBasketComponent,
    TooltipComponent,
  ],
  providers: [
    OnboardingStageTwoInfoService,
    OnboardingStageTwoUIInfoService,
    OnboardingUIInfoService,
    TooltipInfoService,
  ],
  standalone: true,
})
export class OnboardingStageTwoComponent implements OnInit, OnDestroy {
  private readonly onboardingStageTwoInfoService = inject(OnboardingStageTwoInfoService);
  private readonly onboardingStageTwoUIInfoService = inject(OnboardingStageTwoUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly tooltipInfoService = inject(TooltipInfoService);
  private readonly skillsService = inject(SkillsService);

  protected readonly stageForm = this.onboardingStageTwoUIInfoService.stageForm;

  protected readonly nestedSkills$ = this.skillsService.getSkillsNested();

  protected readonly searchedSkills = this.onboardingStageTwoUIInfoService.searchedSkills;

  // Для управления открытыми группами навыков
  protected readonly openSkillGroup = this.onboardingStageTwoUIInfoService.openSkillGroup;

  protected readonly isHintAuthVisible = this.tooltipInfoService.isHintAuthVisible;
  protected readonly isHintLibVisible = this.tooltipInfoService.isHintLibVisible;

  protected readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  protected readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

  protected readonly isChooseSkill = this.onboardingStageTwoUIInfoService.isChooseSkill;
  protected readonly isChooseSkillText = this.onboardingStageTwoUIInfoService.isChooseSkillText;

  /**
   * Проверяет, есть ли открытые группы навыков
   */
  protected readonly hasOpenSkillsGroups = this.onboardingStageTwoUIInfoService.hasOpenSkillsGroups;

  /**
   * Обработчик переключения группы навыков
   * @param skillName - название навыка
   * @param isOpen - флаг открытия/закрытия группы
   */
  onSkillGroupToggled(isOpen: boolean, skillName: string): void {
    this.onboardingStageTwoUIInfoService.onSkillGroupToggled(isOpen, skillName);
  }

  /**
   * Проверяет, должна ли группа навыков быть отключена
   * @param skillName - название навыка
   */
  isSkillGroupDisabled(skillName: string): boolean {
    return this.onboardingStageTwoUIInfoService.isSkillGroupDisabled(skillName);
  }

  ngOnInit(): void {
    this.onboardingStageTwoInfoService.initializationFormValues();
  }

  ngAfterViewInit(): void {
    this.onboardingStageTwoInfoService.initializationSkills();
  }

  ngOnDestroy(): void {
    this.onboardingStageTwoInfoService.destroy();
  }

  toggleTooltip(option: "show" | "hide", type: "auth" | "lib"): void {
    option === "show"
      ? this.tooltipInfoService.showTooltip(type)
      : this.tooltipInfoService.hideTooltip(type);
  }

  onSkipRegistration(): void {
    this.onboardingStageTwoInfoService.onSkipRegistration();
  }

  onSubmit(): void {
    this.onboardingStageTwoInfoService.onSubmit();
  }

  onAddSkill(newSkill: Skill): void {
    this.onboardingStageTwoInfoService.onAddSkill(newSkill);
  }

  onRemoveSkill(oddSkill: Skill): void {
    this.onboardingStageTwoInfoService.onRemoveSkill(oddSkill);
  }

  onOptionToggled(toggledSkill: Skill): void {
    this.onboardingStageTwoInfoService.onOptionToggled(toggledSkill);
  }

  onSearchSkill(query: string): void {
    this.onboardingStageTwoInfoService.onSearchSkill(query);
  }
}
