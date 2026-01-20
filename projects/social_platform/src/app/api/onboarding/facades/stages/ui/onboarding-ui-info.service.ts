/** @format */

import { Injectable, signal } from "@angular/core";

@Injectable()
export class OnboardingUIInfoService {
  readonly stageSubmitting = signal(false);
  readonly skipSubmitting = signal(false);
  readonly stageTouched = signal<boolean>(false);
}
