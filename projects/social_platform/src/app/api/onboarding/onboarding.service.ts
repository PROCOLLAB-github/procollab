/** @format */

import { inject, Injectable } from "@angular/core";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { UserInput } from "@domain/auth/user.model";
import { BehaviorSubject, EMPTY, of, take } from "rxjs";

/** Состояние онбординга: данные формы, текущий этап, синхронизация с профилем. */
@Injectable({
  providedIn: "root",
})
export class OnboardingService {
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly profile = this.profileInfoService.profile;

  constructor() {
    this._formValue$.next({
      avatar: this.profile()?.personal.avatar,
      city: this.profile()?.personal.city,
      education: this.profile()?.relations.education,
      workExperience: this.profile()?.relations.workExperience,
      speciality: this.profile()?.personal.speciality,
      skills: this.profile()?.relations.skills,
      userType: this.profile()?.personal.userType,
    });

    this._currentStage$.next(this.profile()?.personal.onboardingStage as number);
  }

  private _formValue$ = new BehaviorSubject<UserInput>({});
  formValue$ = this._formValue$.asObservable();

  private _currentStage$ = new BehaviorSubject<number | null>(0);
  currentStage$ = this._currentStage$.asObservable();

  setFormValue(updates: UserInput): void {
    this.formValue$.pipe(take(1)).subscribe(fv => {
      this._formValue$.next({ ...fv, ...updates });
    });
  }

  setStep(step: number | null): void {
    this._currentStage$.next(step);
  }
}
