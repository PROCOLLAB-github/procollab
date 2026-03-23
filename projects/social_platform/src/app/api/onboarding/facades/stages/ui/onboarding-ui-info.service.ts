/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { AsyncState, initial, isLoading } from "../../../../../domain/shared/async-state";

@Injectable()
export class OnboardingUIInfoService {
  readonly stageSubmitting$ = signal<AsyncState<void>>(initial());
  readonly stageSubmitting = computed(() => isLoading(this.stageSubmitting$()));

  readonly skipSubmitting$ = signal<AsyncState<void>>(initial());
  readonly skipSubmitting = computed(() => isLoading(this.skipSubmitting$()));

  readonly stageTouched = signal<boolean>(false);
}
