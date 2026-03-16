/** @format */

import { Injectable, signal } from "@angular/core";
import { AsyncState, initial } from "../../../../../domain/shared/async-state";

@Injectable()
export class OnboardingUIInfoService {
  readonly stageSubmitting = signal<AsyncState<void>>(initial());
  readonly skipSubmitting = signal<AsyncState<void>>(initial());
  readonly stageTouched = signal<boolean>(false);
}
