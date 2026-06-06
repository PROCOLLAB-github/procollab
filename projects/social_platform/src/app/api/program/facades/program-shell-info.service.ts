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
import { Observable, finalize, shareReplay, of, tap } from "rxjs";
import { readCache, writeCache } from "@utils/cache";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";
import { ParticipatingProgramUseCase } from "../use-cases/participating-program.use-case";
import { Result, ok } from "@domain/shared/result.type";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { GetProgramsUseCase } from "../use-cases/get-programs.use-case";

const PROGRAM_CACHE_KEY = "programs";
const PROGRAM_ACTUAL_CACHE_KEY = "programs:actual";
const CACHE_VERSION = 1;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

/** Facade shell-страницы программ: список программ, актуальные, статус участия (с 24h TTL-кешем). */
@Injectable({
  providedIn: "root",
})
export class ProgramShellInfoService {
  private readonly getProgramsUseCase = inject(GetProgramsUseCase);
  private readonly participatingProgramUseCase = inject(ParticipatingProgramUseCase);

  private readonly programs$ = signal<AsyncState<Program[], unknown>>(initial());

  readonly programs = computed(() => {
    const state = this.programs$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    if (isFailure(state)) return state.previous ?? [];
    return [];
  });

  readonly actualPrograms = computed(() => {
    return this.programs()
      .filter(p => Date.now() < Date.parse(p.datetimeRegistrationEnds))
      .slice(0, 3);
  });

  private programsInflight: Observable<Result<ApiPagination<Program>, unknown>> | null = null;

  ensureProgramsLoaded(filter?: HttpParams): Observable<Result<ApiPagination<Program>, unknown>> {
    if (filter && filter.keys().length > 0) {
      if (this.programsInflight) return this.programsInflight;
      return this.fetchPrograms(filter);
    }

    if (isSuccess(this.programs$())) {
      const data = this.programs();
      return of(
        ok<ApiPagination<Program>>({ count: data.length, results: data, next: "", previous: "" }),
      );
    }

    const cached = readCache<Program[] | null>(
      PROGRAM_CACHE_KEY,
      CACHE_VERSION,
      CACHE_TTL,
      raw => plainToInstance(Program, raw as object[]) as Program[],
    );

    if (cached) {
      this.programs$.set(success(cached));

      this.fetchPrograms();
      return of(
        ok<ApiPagination<Program>>({
          count: cached.length,
          results: cached,
          next: "",
          previous: "",
        }),
      );
    }

    return this.fetchPrograms();
  }

  refreshPrograms(): void {
    this.programsInflight = null;
    this.fetchPrograms();
  }

  invalidatePrograms(): void {
    this.programsInflight = null;
    this.programs$.set(initial());
  }

  private fetchPrograms(filter?: HttpParams): Observable<Result<ApiPagination<Program>, unknown>> {
    if (this.programsInflight) return this.programsInflight;

    const state = this.programs$();
    const prev = isSuccess(state) ? state.data : undefined;
    this.programs$.set(loading(prev));

    const source$ = this.participatingProgramUseCase.execute(filter);

    const request$ = source$.pipe(
      tap(result => {
        if (!result.ok) return;
        this.programs$.set(success(result.value.results));
        try {
          writeCache(PROGRAM_CACHE_KEY, CACHE_VERSION, result.value.results);
        } catch {}
      }),
      finalize(() => (this.programsInflight = null)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.programsInflight = request$;

    request$.subscribe({
      error: error => this.programs$.set(failure(error, prev)),
    });

    return request$;
  }
}
