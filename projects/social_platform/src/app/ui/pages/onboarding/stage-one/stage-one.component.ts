/** @format */

import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { concatMap, map, Observable, Subscription, take } from "rxjs";
import { ControlErrorPipe, ValidationService } from "@corelib";
import { ActivatedRoute, Router } from "@angular/router";
import { OnboardingService } from "../../../../api/onboarding/onboarding.service";
import { ButtonComponent, IconComponent } from "@ui/components";
import { CommonModule } from "@angular/common";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { SpecializationsGroup } from "projects/social_platform/src/app/domain/specializations/specializations-group";
import { SpecializationsGroupComponent } from "@ui/shared/specializations-group/specializations-group.component";
import { Specialization } from "projects/social_platform/src/app/domain/specializations/specialization";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { SpecializationsService } from "projects/social_platform/src/app/api/specializations/specializations.service";

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
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    ControlErrorPipe,
    AutoCompleteInputComponent,
    SpecializationsGroupComponent,
    CommonModule,
    TooltipComponent,
  ],
})
export class OnboardingStageOneComponent implements OnInit, OnDestroy {
  constructor(
    private readonly nnFb: NonNullableFormBuilder,
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly validationService: ValidationService,
    private readonly specsService: SpecializationsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdref: ChangeDetectorRef
  ) {}

  stageForm = this.nnFb.group({
    speciality: [""],
  });

  nestedSpecializations$: Observable<SpecializationsGroup[]> = this.route.data.pipe(
    map(r => r["data"])
  );

  isHintAuthVisible = false;
  isHintLibVisible = false;

  inlineSpecializations = signal<Specialization[]>([]);

  stageSubmitting = signal(false);
  skipSubmitting = signal(false);

  errorMessage = ErrorMessage;

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const formValueState$ = this.onboardingService.formValue$.pipe(take(1)).subscribe(fv => {
      this.stageForm.patchValue({
        speciality: fv.speciality,
      });
    });

    const formValueChange$ = this.stageForm.valueChanges.subscribe(value => {
      this.onboardingService.setFormValue(value);
    });

    this.subscriptions$().push(formValueState$, formValueChange$);
  }

  ngAfterViewInit(): void {
    const specialityProfile$ = this.onboardingService.formValue$.subscribe(fv => {
      this.stageForm.patchValue({ speciality: fv.speciality });
    });

    this.cdref.detectChanges();

    specialityProfile$ && this.subscriptions$().push(specialityProfile$);
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

  // Для управления открытыми группами специализаций
  openSpecializationGroup: string | null = null;

  /**
   * Проверяет, есть ли открытые группы специализаций
   */
  hasOpenSpecializationsGroups(): boolean {
    return this.openSpecializationGroup !== null;
  }

  /**
   * Обработчик переключения группы специализаций
   * @param isOpen - флаг открытия/закрытия группы
   * @param groupName - название группы
   */
  onSpecializationsGroupToggled(isOpen: boolean, groupName: string): void {
    this.openSpecializationGroup = isOpen ? groupName : null;
  }

  /**
   * Проверяет, должна ли группа специализаций быть отключена
   * @param groupName - название группы для проверки
   */
  isSpecializationGroupDisabled(groupName: string): boolean {
    return this.openSpecializationGroup !== null && this.openSpecializationGroup !== groupName;
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

    this.authService
      .saveProfile(this.stageForm.value)
      .pipe(concatMap(() => this.authService.setOnboardingStage(2)))
      .subscribe({
        next: () => this.completeRegistration(2),
        error: () => this.stageSubmitting.set(false),
      });
  }

  onSelectSpec(speciality: Specialization): void {
    this.stageForm.patchValue({ speciality: speciality.name });
  }

  onSearchSpec(query: string): void {
    this.specsService
      .getSpecializationsInline(query, 1000, 0)
      .pipe(take(1))
      .subscribe(({ results }) => {
        this.inlineSpecializations.set(results);
      });
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(true);
    this.onboardingService.setFormValue(this.stageForm.value);
    this.router.navigateByUrl(
      stage === 2 ? "/office/onboarding/stage-2" : "/office/onboarding/stage-3"
    );
    this.skipSubmitting.set(false);
  }
}
