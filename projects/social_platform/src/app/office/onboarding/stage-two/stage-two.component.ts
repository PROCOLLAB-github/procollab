/** @format */

import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { concatMap, map, Observable, Subscription, take } from "rxjs";
import { AuthService } from "@auth/services";
import { ControlErrorPipe, ValidationService } from "@corelib";
import { ActivatedRoute, Router } from "@angular/router";
import { OnboardingService } from "../services/onboarding.service";
import { ButtonComponent, IconComponent } from "@ui/components";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { Skill } from "@office/models/skill";
import { SkillsService } from "@office/services/skills.service";
import { SkillsGroup } from "@office/models/skills-group";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { SkillsBasketComponent } from "@office/shared/skills-basket/skills-basket.component";
import { ModalComponent } from "@ui/components/modal/modal.component";

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
  standalone: true,
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
  ],
})
export class OnboardingStageTwoComponent implements OnInit, OnDestroy {
  constructor(
    private readonly nnFb: NonNullableFormBuilder,
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly validationService: ValidationService,
    private readonly skillsService: SkillsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdref: ChangeDetectorRef
  ) {}

  stageForm = this.nnFb.group({
    skills: this.nnFb.control<Skill[]>([]),
  });

  nestedSkills$: Observable<SkillsGroup[]> = this.route.data.pipe(map(r => r["data"]));

  searchedSkills = signal<Skill[]>([]);

  tooltipAuthText =
    "Постарайся вспомнить все, чему тебя учили и то, что ты делал (читать, считать, программировать) Постарайся не врать, но и не будь сильно критичным к себе.";

  tooltipLibText =
    "База с навыками, которая может пополняться благодаря тебе! Если не найдешь свой навык, смело пиши на @procollab_support и мы добавим твой уникальный навык";

  isHintAuthVisible = false;
  isHintLibVisible = false;

  stageSubmitting = signal(false);
  skipSubmitting = signal(false);

  isChooseSkill = signal(false);
  isChooseSkillText = signal("");

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const fv$ = this.onboardingService.formValue$
      .pipe(take(1))
      .subscribe(({ skills }) => this.stageForm.patchValue({ skills }));

    const formValueChange$ = this.stageForm.valueChanges.subscribe(value => {
      this.onboardingService.setFormValue(value);
    });

    this.subscriptions$().push(fv$, formValueChange$);
  }

  ngAfterViewInit(): void {
    const skillsProfile$ = this.onboardingService.formValue$.subscribe(fv => {
      this.stageForm.patchValue({ skills: fv.skills });
    });

    this.cdref.detectChanges();

    skillsProfile$ && this.subscriptions$().push(skillsProfile$);
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  showTooltip(type: "auth" | "lib"): void {
    type === "auth" ? (this.isHintAuthVisible = true) : (this.isHintLibVisible = true);
  }

  hideTooltip(type: "auth" | "lib"): void {
    type === "auth" ? (this.isHintAuthVisible = false) : (this.isHintLibVisible = false);
  }

  onSkipRegistration(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.completeRegistration(3);
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.stageSubmitting.set(true);

    const { skills } = this.stageForm.getRawValue();

    this.authService
      .saveProfile({ skillsIds: skills.map(skill => skill.id) })
      .pipe(concatMap(() => this.authService.setOnboardingStage(2)))
      .subscribe({
        next: () => this.completeRegistration(3),
        error: err => {
          this.stageSubmitting.set(false);
          if (err.status === 400) {
            this.isChooseSkill.set(true);
            this.isChooseSkillText.set(err.error[0]);
          }
        },
      });
  }

  onAddSkill(newSkill: Skill): void {
    const { skills } = this.stageForm.getRawValue();

    const isPresent = skills.some(s => s.id === newSkill.id);

    if (isPresent) return;

    this.stageForm.patchValue({ skills: [newSkill, ...skills] });
  }

  onRemoveSkill(oddSkill: Skill): void {
    const { skills } = this.stageForm.getRawValue();

    this.stageForm.patchValue({ skills: skills.filter(skill => skill.id !== oddSkill.id) });
  }

  onOptionToggled(toggledSkill: Skill): void {
    const { skills } = this.stageForm.getRawValue();

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  onSearchSkill(query: string): void {
    this.skillsService
      .getSkillsInline(query, 1000, 0)
      .subscribe(({ results }) => this.searchedSkills.set(results));
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(true);
    this.onboardingService.setFormValue(this.stageForm.value);
    stage === 3 && this.router.navigateByUrl("/office/onboarding/stage-3");
    this.skipSubmitting.set(false);
  }
}
