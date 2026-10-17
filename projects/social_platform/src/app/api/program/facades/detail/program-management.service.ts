/** @format */

import { DestroyRef, Injectable, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from "rxjs";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import {
  ManagementEvaluation,
  ManagementPage,
  ManagementParticipant,
  ManagementProject,
  ManagementProjectsPage,
  ManagementQuery,
  ManagementSection,
  ManagementTeam,
  ProgramManagement,
} from "@domain/program/program-management.model";
import { Program } from "@domain/program/program.model";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";

export interface ManagementContext {
  programId: number;
  section: ManagementSection;
  query: ManagementQuery;
  linkId?: number;
  selectedId?: number;
}
interface Content {
  participants?: ManagementPage<ManagementParticipant>;
  projects?: ManagementProjectsPage;
  evaluation?: ManagementEvaluation;
}

@Injectable()
export class ProgramManagementService {
  readonly api = inject(ProgramManagementUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly programUI = inject(ProgramDetailMainUIInfoService);
  private readonly requests = new Subject<ManagementContext>();
  private readonly cancelTeam = new Subject<void>();
  readonly program = signal<ProgramManagement | null>(null);
  readonly participants = signal<ManagementPage<ManagementParticipant> | null>(null);
  readonly projects = signal<ManagementProjectsPage | null>(null);
  readonly evaluation = signal<ManagementEvaluation | null>(null);
  readonly pending = signal(false);
  readonly error = signal<HttpErrorResponse | null>(null);
  readonly selected = signal<ManagementProject | null>(null);
  readonly team = signal<ManagementTeam | null>(null);
  readonly teamPending = signal(false);
  readonly teamError = signal<HttpErrorResponse | null>(null);
  readonly teamOpen = signal(false);
  context: ManagementContext | null = null;

  constructor() {
    this.requests
      .pipe(
        tap(ctx => {
          if (this.context?.programId !== ctx.programId) this.program.set(null);
          if (this.context?.programId !== ctx.programId || this.context?.section !== ctx.section)
            this.clearSelection();
          this.context = ctx;
          this.pending.set(true);
          this.error.set(null);
          this.closeTeam();
        }),
        switchMap(ctx => {
          const content =
            ctx.section === "participants"
              ? this.api
                  .participants(ctx.programId, ctx.query)
                  .pipe(map(participants => ({ participants }) as Content))
              : ctx.section === "projects"
                ? this.api
                    .projects(ctx.programId, ctx.query)
                    .pipe(map(projects => ({ projects }) as Content))
                : ctx.section === "evaluation" && ctx.linkId
                  ? this.api
                      .evaluation(ctx.programId, ctx.linkId)
                      .pipe(map(evaluation => ({ evaluation }) as Content))
                  : of({} as Content);
          return forkJoin({ program: this.api.get(ctx.programId), content }).pipe(
            tap(({ program, content }) => {
              this.program.set(program);
              this.participants.set(content.participants ?? null);
              this.projects.set(content.projects ?? null);
              this.evaluation.set(content.evaluation ?? null);
              const selectedId = ctx.selectedId ?? this.selected()?.id;
              this.selected.set(content.projects?.results.find(p => p.id === selectedId) ?? null);
              this.programUI.program.set(
                Object.assign(new Program(), Program.default(), program, { isUserManager: true }),
              );
            }),
            catchError((error: HttpErrorResponse) => {
              this.error.set(error);
              this.program.set(null);
              this.participants.set(null);
              this.projects.set(null);
              this.evaluation.set(null);
              this.clearSelection();
              return of(null);
            }),
            tap(() => this.pending.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
  load(ctx: ManagementContext): void {
    this.requests.next(ctx);
  }
  retry(): void {
    if (this.context) this.load(this.context);
  }
  select(project: ManagementProject): void {
    this.closeTeam();
    this.selected.set(project);
  }
  clearSelection(): void {
    this.closeTeam();
    this.selected.set(null);
  }
  openTeam(): void {
    const project = this.selected(),
      ctx = this.context;
    if (!project || !ctx) return;
    this.cancelTeam.next();
    this.team.set(null);
    this.teamError.set(null);
    this.teamOpen.set(true);
    this.teamPending.set(true);
    this.api
      .team(ctx.programId, project.id)
      .pipe(takeUntil(this.cancelTeam), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: team => {
          this.team.set(team);
          this.teamPending.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.teamError.set(error);
          this.teamPending.set(false);
        },
      });
  }
  closeTeam(): void {
    this.cancelTeam.next();
    this.teamOpen.set(false);
    this.teamPending.set(false);
    this.team.set(null);
    this.teamError.set(null);
  }
}
