/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, EMPTY, map, startWith, Subject, switchMap } from "rxjs";
import { ButtonDirective, CardDirective, StateComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { GetProgramUseCase } from "@api/program/use-cases/get-program.use-case";
import { GetProjectRatingsUseCase } from "@api/program/use-cases/get-project-ratings.use-case";
import { cabinetReturnUrl } from "@api/program/evaluation-navigation.service";
import { ProjectRate } from "@domain/project/project-rate";
import { RatingCardComponent } from "../detail/list/rating-card/rating-card.component";

@Component({
  selector: "app-rating-workspace",
  templateUrl: "./rating-workspace.component.html",
  styleUrl: "./rating-workspace.component.scss",
  imports: [
    ButtonDirective,
    CardDirective,
    DatePipe,
    ModalComponent,
    RatingCardComponent,
    RouterLink,
    StateComponent,
  ],
  providers: [ProgramDetailMainUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingWorkspaceComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getProgram = inject(GetProgramUseCase);
  private readonly getRatings = inject(GetProjectRatingsUseCase);
  private readonly programState = inject(ProgramDetailMainUIInfoService);
  private readonly refresh = new Subject<void>();
  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly returnTree = () =>
    this.router.parseUrl(
      cabinetReturnUrl(this.query().get("returnUrl"), Number(this.routeParams().get("programId"))),
    );
  readonly program = this.programState.program;
  readonly expired = this.programState.evaluationDateExpired;
  readonly card = viewChild(RatingCardComponent);
  readonly project = signal<ProjectRate | null>(null);
  readonly loading = signal(true);
  readonly failed = signal<string | null>(null);
  readonly unauthorized = signal(false);
  readonly leaveOpen = signal(false);
  private resolveLeave?: (leave: boolean) => void;

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => ({
          programId: Number(params.get("programId")),
          projectId: Number(params.get("projectId")),
        })),
        distinctUntilChanged((a, b) => a.programId === b.programId && a.projectId === b.projectId),
        switchMap(ids =>
          this.refresh.pipe(
            startWith(undefined),
            switchMap(() => this.loadProject(ids.programId, ids.projectId)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ projectId, result }) => {
        this.loading.set(false);
        if (!result.ok) {
          this.showError(result.error.cause);
          return;
        }
        const project = result.value.results.find(row => row.id === projectId);
        if (project) this.project.set(project);
        else this.failed.set("Проект недоступен для оценки. Возможно, назначение было отменено.");
      });
    this.destroyRef.onDestroy(() => this.resolveLeave?.(false));
  }

  retry(): void {
    this.refresh.next();
  }

  private loadProject(programId: number, projectId: number) {
    this.project.set(null);
    this.programState.program.set(undefined);
    this.failed.set(null);
    this.unauthorized.set(false);
    this.loading.set(true);
    if (
      !Number.isSafeInteger(programId) ||
      programId < 1 ||
      !Number.isSafeInteger(projectId) ||
      projectId < 1
    ) {
      this.loading.set(false);
      this.failed.set("Проект для оценки не найден.");
      return EMPTY;
    }
    return this.getProgram.execute(programId).pipe(
      switchMap(result => {
        if (!result.ok) {
          this.loading.set(false);
          this.showError(result.error.cause);
          return EMPTY;
        }
        this.programState.applyFormatingProgramData(result.value);
        return this.getRatings
          .execute(programId, new HttpParams().set("project_id", projectId))
          .pipe(map(result => ({ projectId, result })));
      }),
    );
  }

  private showError(cause: unknown): void {
    const status = cause instanceof HttpErrorResponse ? cause.status : undefined;
    this.unauthorized.set(status === 401);
    this.failed.set(
      status === 403
        ? "У вас нет доступа к оценке проектов этой программы."
        : status === 404
          ? "Программа или проект для оценки недоступны."
          : "Не удалось загрузить проект. Попробуйте еще раз.",
    );
  }

  canLeave(): Promise<boolean> | boolean {
    if (this.card()?.state.submitLoading()) return false;
    if (!this.card()?.hasUnsavedChanges()) return true;
    this.card()?.state.showConfirmRateModal.set(false);
    if (this.resolveLeave) return false;
    this.leaveOpen.set(true);
    return new Promise(resolve => {
      this.resolveLeave = resolve;
    });
  }

  answerLeave(leave: boolean): void {
    this.leaveOpen.set(false);
    this.resolveLeave?.(leave);
    this.resolveLeave = undefined;
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.card()?.hasUnsavedChanges() || this.card()?.state.submitLoading()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
}
