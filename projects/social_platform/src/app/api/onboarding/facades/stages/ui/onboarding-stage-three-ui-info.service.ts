/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { UserInput } from "@domain/auth/user.model";
import { OnboardingService } from "../../../onboarding.service";

/** UI-состояние этапа 3 онбординга: computed-сигналы формы шага. */
@Injectable()
export class OnboardingStageThreeUIInfoService {
  private readonly onboardingService = inject(OnboardingService);

  readonly userRole = signal<number>(-1);

  applyInitFormValues(fv: UserInput): void {
    this.userRole.set(fv.userType ? fv.userType : -1);
  }

  applySetRole(role: number) {
    this.userRole.set(role);
    this.onboardingService.setFormValue({ userType: role });
  }
}
