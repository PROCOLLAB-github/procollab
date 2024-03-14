/** @format */

import { Injectable } from "@angular/core";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { BehaviorSubject, take } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class OnboardingService {
  constructor(private authService: AuthService) {
    this.authService.profile.pipe(take(1)).subscribe(p => {
      this._formValue$.next({
        avatar: p.avatar,
        city: p.city,
        organization: p.organization,
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
