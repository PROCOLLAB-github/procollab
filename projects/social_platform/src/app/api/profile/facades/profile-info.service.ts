/** @format */

import { Injectable, computed, signal, inject } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User, UserRole } from "@domain/auth/user.model";
import { Project } from "@domain/project/project.model";
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
import { Observable, finalize, forkJoin, shareReplay } from "rxjs";
import { plainToInstance } from "class-transformer";
import { clearCacheKey, readCache, writeCache } from "@utils/cache";

const ROLES_CACHE_KEY = "users:roles";
const CHANGEABLE_ROLES_CACHE_KEY = "users:changeableRoles";
const CACHE_VERSION = 1;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

/** Facade текущего профиля: AsyncState для user / roles / changeableRoles / leaderProjects. */
@Injectable({ providedIn: "root" })
export class ProfileInfoService {
  private readonly profile$ = signal<AsyncState<User>>(initial());
  private readonly roles$ = signal<AsyncState<UserRole[]>>(initial());
  private readonly changeableRoles$ = signal<AsyncState<UserRole[]>>(initial());
  private readonly leaderProjects$ = signal<AsyncState<Project[]>>(initial());

  private readonly authRepository = inject(AuthRepositoryPort);

  readonly profile = computed(() => {
    const state = this.profile$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? null;
    if (isFailure(state)) return state.previous ?? null;
    return null;
  });

  readonly roles = computed(() => {
    const state = this.roles$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? null;
    if (isFailure(state)) return state.previous ?? null;
    return null;
  });

  readonly changeableRoles = computed(() => {
    const state = this.changeableRoles$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? null;
    if (isFailure(state)) return state.previous ?? null;
    return null;
  });

  readonly leaderProjects = computed(() => {
    const state = this.leaderProjects$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    if (isFailure(state)) return state.previous ?? [];
    return [];
  });

  readonly isLoading = computed(() => {
    return (
      isLoading(this.profile$()) || isLoading(this.roles$()) || isLoading(this.changeableRoles$())
    );
  });

  readonly isLeaderProjectsLoading = computed(() => {
    return isLoading(this.leaderProjects$());
  });

  private profileInflight: Observable<unknown> | null = null;
  private leaderInflight: Observable<unknown> | null = null;

  ensureProfileLoaded(): void {
    if (
      this.isLoading() ||
      (isSuccess(this.profile$()) && isSuccess(this.roles$()) && isSuccess(this.changeableRoles$()))
    )
      return;

    // Попытаться hydrat'ить редко меняемые справочники из localStorage
    const rolesCached = readCache<UserRole[]>(
      ROLES_CACHE_KEY,
      CACHE_VERSION,
      CACHE_TTL,
      raw => plainToInstance(UserRole, raw as object[]) as UserRole[],
    );

    const changeableCached = readCache<UserRole[]>(
      CHANGEABLE_ROLES_CACHE_KEY,
      CACHE_VERSION,
      CACHE_TTL,
      raw => plainToInstance(UserRole, raw as object[]) as UserRole[],
    );

    if (rolesCached) this.roles$.set(success(rolesCached));
    if (changeableCached) this.changeableRoles$.set(success(changeableCached));

    this.fetchProfile();
  }

  ensureLeaderProjectsLoaded(): void {
    if (this.isLeaderProjectsLoading() || isSuccess(this.leaderProjects$())) return;
    this.fetchLeaderProjects();
  }

  private fetchProfile(): void {
    if (this.profileInflight) return;

    const profile = this.profile$();
    const prevProfile = isSuccess(profile) ? profile.data : undefined;
    this.profile$.set(loading(prevProfile));

    const roles = this.roles$();
    const prevRoles = isSuccess(roles) ? roles.data : undefined;
    this.roles$.set(loading(prevRoles));

    const changeableRoles = this.changeableRoles$();
    const prevChagableRoles = isSuccess(changeableRoles) ? changeableRoles.data : undefined;
    this.changeableRoles$.set(loading(prevChagableRoles));

    this.profileInflight = forkJoin({
      profile: this.authRepository.fetchProfile(),
      roles: this.authRepository.fetchUserRoles(),
      changeableRoles: this.authRepository.fetchChangeableRoles(),
    }).pipe(
      finalize(() => (this.profileInflight = null)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.profileInflight.subscribe({
      next: (result: any) => {
        this.profile$.set(success(result.profile));
        this.roles$.set(success(result.roles));
        this.changeableRoles$.set(success(result.changeableRoles));
        try {
          writeCache(ROLES_CACHE_KEY, CACHE_VERSION, result.roles);
          writeCache(CHANGEABLE_ROLES_CACHE_KEY, CACHE_VERSION, result.changeableRoles);
        } catch {}
      },
      error: error => {
        this.profile$.set(failure(error, prevProfile));
        this.roles$.set(failure(error, prevRoles));
        this.changeableRoles$.set(failure(error, prevChagableRoles));
      },
    });
  }

  private fetchLeaderProjects(): void {
    if (this.leaderInflight) return;

    const leaderProjects = this.leaderProjects$();
    const prevLeaderProjects = isSuccess(leaderProjects) ? leaderProjects.data : undefined;
    this.leaderProjects$.set(loading(prevLeaderProjects));

    this.leaderInflight = this.authRepository.fetchLeaderProjects().pipe(
      finalize(() => (this.leaderInflight = null)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.leaderInflight.subscribe({
      next: (result: any) => this.leaderProjects$.set(success(result.results)),
      error: error => this.leaderProjects$.set(failure(error, prevLeaderProjects)),
    });
  }

  refreshProfile(): void {
    this.profileInflight = null;
    this.fetchProfile();
  }

  refreshLeaderProjects(): void {
    this.leaderInflight = null;
    this.fetchLeaderProjects();
  }

  invalidateProfile(): void {
    this.profileInflight = null;
    this.profile$.set(initial());
    this.roles$.set(initial());
    this.changeableRoles$.set(initial());
    clearCacheKey(ROLES_CACHE_KEY, CACHE_VERSION);
    clearCacheKey(CHANGEABLE_ROLES_CACHE_KEY, CACHE_VERSION);
  }

  invalidateLeaderProjects(): void {
    this.leaderInflight = null;
    this.leaderProjects$.set(initial());
  }

  applyProfileUpdated(profile: User): void {
    this.profile$.set(success(profile));
  }
}
