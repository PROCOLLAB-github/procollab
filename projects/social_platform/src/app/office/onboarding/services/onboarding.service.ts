/** @format */

import { Injectable } from "@angular/core";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { BehaviorSubject, take } from "rxjs";

/**
 * СЕРВИС УПРАВЛЕНИЯ СОСТОЯНИЕМ ОНБОРДИНГА
 *
 * Назначение: Централизованное управление данными и состоянием процесса онбординга
 *
 * Что делает:
 * - Хранит и управляет данными формы онбординга между этапами
 * - Отслеживает текущий этап онбординга пользователя
 * - Синхронизирует состояние с профилем пользователя из AuthService
 * - Предоставляет реактивные потоки данных для компонентов
 * - Обеспечивает персистентность данных при переходах между этапами
 *
 * Что принимает:
 * - Обновления данных формы через setFormValue(updates: Partial<User>)
 * - Изменения текущего этапа через setStep(step: number | null)
 * - Начальные данные профиля из AuthService при инициализации
 *
 * Что возвращает:
 * - formValue$: Observable<Partial<User>> - поток данных формы
 * - currentStage$: Observable<number | null> - поток текущего этапа
 *
 * Архитектурные особенности:
 * - Использует BehaviorSubject для хранения состояния
 * - Singleton сервис (providedIn: 'root')
 * - Автоматическая инициализация из профиля пользователя
 * - Реактивное программирование с RxJS
 *
 * Жизненный цикл данных:
 * 1. Инициализация из AuthService.profile
 * 2. Накопление изменений через setFormValue
 * 3. Передача данных между компонентами этапов
 * 4. Финальное сохранение в профиль пользователя
 */
@Injectable({
  providedIn: "root",
})
export class OnboardingService {
  constructor(private authService: AuthService) {
    this.authService.profile.pipe(take(1)).subscribe(p => {
      this._formValue$.next({
        avatar: p.avatar,
        city: p.city,
        education: p.education,
        workExperience: p.workExperience,
        speciality: p.speciality,
        skills: p.skills,
        userType: p.userType,
      });

      this._currentStage$.next(p.onboardingStage as number);
    });
  }

  private _formValue$ = new BehaviorSubject<Partial<User>>({});
  formValue$ = this._formValue$.asObservable();

  private _currentStage$ = new BehaviorSubject<number | null>(0);
  currentStage$ = this._currentStage$.asObservable();

  setFormValue(updates: Partial<User>): void {
    this.formValue$.pipe(take(1)).subscribe(fv => {
      this._formValue$.next({ ...fv, ...updates });
    });
  }

  setStep(step: number | null): void {
    this._currentStage$.next(step);
  }
}
