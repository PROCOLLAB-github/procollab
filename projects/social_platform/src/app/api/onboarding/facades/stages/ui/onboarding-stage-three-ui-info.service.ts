/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { OnboardingService } from "../../../onboarding.service";

@Injectable()
export class OnboardingStageThreeUIInfoService {
  private readonly onboardingService = inject(OnboardingService);

  readonly userRole = signal<number>(-1);

  applyInitFormValues(fv: Partial<User>): void {
    this.userRole.set(fv.userType ? fv.userType : -1);
  }

  applySetRole(role: number) {
    this.userRole.set(role);
    this.onboardingService.setFormValue({ userType: role });
  }
}
