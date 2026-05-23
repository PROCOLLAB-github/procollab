/** @format */

import { Injectable, computed, inject, signal } from "@angular/core";
import { Program } from "@domain/program/program.model";
import {
  AsyncState,
  failure,
  initial,
  isFailure,
  isLoading,
  isSuccess,
  loading,
  success,
} from "@domain/shared/async-state";
import { Observable, finalize, shareReplay } from "rxjs";
import { GetActualProgramsUseCase } from "../use-cases/get-actual-programs.use-case";

@Injectable({
  providedIn: "root",
})
export class ProgramShellInfoService {
  private readonly getActualProgramsUseCase = inject(GetActualProgramsUseCase);
  private readonly actualPrograms$ = signal<AsyncState<Program[], unknown>>(initial());

  readonly actualPrograms = computed(() => {
    const state = this.actualPrograms$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    if (isFailure(state)) return state.previous ?? [];
    return [];
  });

  private inflight: Observable<unknown> | null = null;

  ensureLoaded() {
    if (isSuccess(this.actualPrograms$()) || isLoading(this.actualPrograms$())) return;
    this.fetch();
  }

  refresh(): void {
    this.inflight = null;
    this.fetch();
  }

  invalidate(): void {
    this.inflight = null;
    this.actualPrograms$.set(initial());
  }

  private fetch() {
    if (this.inflight) return;

    const state = this.actualPrograms$();
    const prev = isSuccess(state) ? state.data : undefined;
    this.actualPrograms$.set(loading(prev));

    const request$ = this.getActualProgramsUseCase.execute().pipe(
      finalize(() => (this.inflight = null)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.inflight = request$;

    request$.subscribe({
      next: result => {
        if (!result.ok) {
          this.actualPrograms$.set(failure(result.error, prev));
          return;
        }

        const programs = result.value.results;
        const resultPrograms = programs.filter(
          program => Date.now() < Date.parse(program.datetimeRegistrationEnds)
        );
        this.actualPrograms$.set(success(resultPrograms.slice(0, 3)));
      },
      error: err => {
        this.actualPrograms$.set(failure(err, prev));
      },
    });
  }
}
