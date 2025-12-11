/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { concatMap, Subscription, take } from "rxjs";
import { Router } from "@angular/router";
import { ButtonComponent } from "@ui/components";
import { UserTypeCardComponent } from "@ui/shared/user-type-card/user-type-card.component";
import { OnboardingService } from "projects/social_platform/src/app/api/onboarding/onboarding.service";
import { AuthService } from "projects/social_platform/src/app/api/auth";

/**
 * КОМПОНЕНТ ТРЕТЬЕГО ЭТАПА ОНБОРДИНГА
 *
 * Назначение: Финальный этап онбординга - выбор роли пользователя (ментор или менти)
 *
 * Что делает:
 * - Отображает интерфейс для выбора типа пользователя
 * - Валидирует выбор роли перед отправкой
 * - Сохраняет выбранную роль в профиле пользователя
 * - Завершает процесс онбординга и перенаправляет в основное приложение
 * - Управляет состоянием загрузки и ошибок
 *
 * Что принимает:
 * - Данные из OnboardingService (текущее состояние формы)
 * - Взаимодействие пользователя (выбор роли, отправка формы)
 *
 * Что возвращает:
 * - Визуальный интерфейс с карточками выбора роли
 * - Навигацию в основное приложение после успешного завершения
 *
 * Состояния компонента:
 * - userRole: выбранная роль (-1 = не выбрана, другие значения = конкретная роль)
 * - stageTouched: флаг попытки отправки без выбора роли
 * - stageSubmitting: флаг процесса отправки данных
 */
@Component({
  selector: "app-stage-three",
  templateUrl: "./stage-three.component.html",
  styleUrl: "./stage-three.component.scss",
  standalone: true,
  imports: [UserTypeCardComponent, ButtonComponent],
})
export class OnboardingStageThreeComponent implements OnInit, OnDestroy {
  constructor(
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const formValue$ = this.onboardingService.formValue$.pipe(take(1)).subscribe(fv => {
      this.userRole = fv.userType ? fv.userType : -1;
    });

    this.subscriptions$.push(formValue$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  userRole!: number;
  stageTouched = false;
  stageSubmitting = false;
  subscriptions$: Subscription[] = [];

  onSetRole(role: number) {
    this.userRole = role;
    this.onboardingService.setFormValue({ userType: role });
  }

  onSubmit() {
    if (this.userRole === -1) {
      this.stageTouched = true;
      return;
    }

    this.stageSubmitting = true;

    this.authService
      .saveProfile({ userType: this.userRole })
      .pipe(concatMap(() => this.authService.setOnboardingStage(null)))
      .subscribe(() => {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnboardingStageTwo"));
      });
  }
}
