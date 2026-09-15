/** @format */

import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";
import { GetProgramRoleWidgetUseCase } from "../../use-cases/get-program-role-widget.use-case";
import { programWidgetRole } from "../../program-widget-presentation";
import { ProgramRoleWidget, ProgramWidgetError } from "@domain/program/program-role-widget.model";
import { AsyncState, failure, loading, success } from "@domain/shared/async-state";
import { EventBus } from "@domain/shared/event-bus";
import { Subscription } from "rxjs";
import { User } from "@domain/auth/user.model";

/** Локальный запрос без кэша/polling. Старый ответ не переживает смену контекста или logout. */
@Injectable()
export class ProgramRoleWidgetService {
  private readonly auth = inject(AuthInfoService);
  private readonly programUI = inject(ProgramDetailMainUIInfoService);
  private readonly request = inject(GetProgramRoleWidgetUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly events = inject(EventBus);
  private readonly routeId = signal(Number(this.route.snapshot.paramMap.get("programId")));
  private readonly rawState = signal<AsyncState<ProgramRoleWidget, ProgramWidgetError>>(loading());
  private readonly loadedKey = signal("");
  private readonly loggedOutProfile = signal<User | null | undefined>(undefined);
  private activeRequest?: Subscription;
  private version = 0;
  private readonly key = computed(() => {
    const program = this.programUI.program();
    const profile = this.auth.profile();
    const userId = profile !== this.loggedOutProfile() ? profile?.id : null;
    const role = programWidgetRole(program);
    return userId && role && program?.id === this.routeId()
      ? `${program.id}:${userId}:${role}`
      : "";
  });
  readonly state = computed<AsyncState<ProgramRoleWidget, ProgramWidgetError>>(() => {
    if (!this.auth.profile()?.id || this.auth.profile() === this.loggedOutProfile())
      return failure("unauthorized");
    const program = this.programUI.program();
    if (program && !programWidgetRole(program)) return failure("forbidden");
    return this.key() && this.loadedKey() === this.key()
      ? this.rawState()
      : loading<ProgramRoleWidget>();
  });
  readonly programId = computed(() => this.programUI.program()?.id ?? 0);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.routeId.set(Number(params.get("programId"))));
    effect(() => {
      const key = this.key();
      untracked(() => this.load(key));
    });
    this.events
      .on("LoggedOut")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loggedOutProfile.set(this.auth.profile());
        this.load("");
      });
    this.events
      .on("ProgramWidgetChanged")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(this.key()));
    this.destroyRef.onDestroy(() => {
      this.version++;
      this.activeRequest?.unsubscribe();
    });
  }
  retry(): void {
    const state = this.state();
    if (state.status === "failure" && state.error === "network") this.load(this.key());
  }
  private load(key: string): void {
    const version = ++this.version;
    this.activeRequest?.unsubscribe();
    this.loadedKey.set(key);
    this.rawState.set(loading());
    if (!key) return;
    const programId = this.programId();
    this.activeRequest = this.request.execute(programId).subscribe(result => {
      if (version !== this.version || key !== this.key()) return;
      this.rawState.set(
        result.ok
          ? result.value.programId === programId
            ? success(result.value)
            : failure("not_found")
          : failure(result.error),
      );
    });
  }
}
