/** @format */

import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
  viewChild,
  DestroyRef,
  computed,
} from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { combineLatest, EMPTY, map, startWith, Subject, switchMap, takeUntil } from "rxjs";
import {
  GetSolutionRatingUseCase,
  RateSolutionUseCase,
} from "@api/solution/use-cases/solution-evaluation.use-cases";
import { SolutionApiError, SolutionRatingFrame } from "@domain/solution/solution-contract.model";
import { validSolutionId } from "@domain/solution/ports/solution.repository.port";
import { ButtonDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { SolutionFieldsComponent } from "@ui/widgets/solution-fields/solution-fields.component";
import { SolutionTeamComponent } from "../solution/solution-team.component";
import { ProjectRatingComponent } from "../detail/list/rating-card/project-rating/project-rating.component";
import { EvaluationCriterion } from "@utils/evaluation-criterion-control";

type Values = Record<string, unknown>;

@Component({
  selector: "app-solution-evaluation",
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    ButtonDirective,
    ModalComponent,
    SolutionFieldsComponent,
    SolutionTeamComponent,
    ProjectRatingComponent,
  ],
  templateUrl: "./solution-evaluation.component.html",
  styleUrl: "./solution-evaluation.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionEvaluationComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly get = inject(GetSolutionRatingUseCase);
  private readonly rate = inject(RateSolutionUseCase);
  private readonly destroy = inject(DestroyRef);
  private readonly retry = new Subject<boolean>();
  private readonly contextChanged = new Subject<void>();
  private context = { programId: 0, solutionId: 0 };
  private resolveLeave?: (value: boolean) => void;
  readonly frame = signal<SolutionRatingFrame | null>(null);
  readonly loading = signal(true);
  readonly error = signal<SolutionApiError | null>(null);
  readonly saveError = signal<SolutionApiError | null>(null);
  readonly busy = signal(false);
  readonly editing = signal(false);
  readonly teamTab = signal(false);
  readonly confirmation = signal(false);
  readonly leaveOpen = signal(false);
  readonly previous = signal<{ name: string; value: string }[]>([]);
  readonly form = new FormControl<Values>({}, { nonNullable: true });
  readonly materials = signal(new FormGroup({}));
  readonly renderer = viewChild(ProjectRatingComponent);
  readonly criteria = computed<EvaluationCriterion[]>(() =>
    (this.frame()?.criteria ?? []).map(c => ({
      ...c,
      description: c.description ?? "",
      value: c.value ?? "",
    })),
  );
  readonly ordered = computed(() => [
    ...this.criteria().filter(c => c.type !== "str"),
    ...this.criteria().filter(c => c.type === "str"),
  ]);
  readonly returnUrl = signal("/office/evaluation");
  readonly returnTree = computed(() => this.router.parseUrl(this.returnUrl()));

  constructor() {
    this.destroy.onDestroy(() => {
      this.resolveLeave?.(false);
      this.contextChanged.next();
    });
    combineLatest([
      combineLatest(this.route.pathFromRoot.map(r => r.paramMap)),
      this.retry.pipe(startWith(false)),
    ])
      .pipe(
        map(([params, preserve]) => ({
          programId: Number(params.find(p => p.has("programId"))?.get("programId")),
          solutionId: Number(params.find(p => p.has("solutionId"))?.get("solutionId")),
          preserve,
        })),
        switchMap(({ programId, solutionId, preserve }) => {
          preserve =
            preserve &&
            this.context.programId === programId &&
            this.context.solutionId === solutionId;
          if (this.context.programId !== programId || this.context.solutionId !== solutionId)
            this.teamTab.set(false);
          this.contextChanged.next();
          this.context = { programId, solutionId };
          this.loading.set(true);
          this.error.set(null);
          this.confirmation.set(false);
          this.busy.set(false);
          if (!preserve) {
            this.frame.set(null);
            this.form.reset({});
            this.previous.set([]);
          }
          const destination = this.route.snapshot.queryParamMap.get("returnUrl");
          const list = `/office/program/${programId}/solutions-rating`;
          this.returnUrl.set(
            destination &&
              (/^\/office\/evaluation(?:\?[^#]*)?$/.test(destination) ||
                destination.split("?")[0] === list)
              ? destination
              : list,
          );
          if (!validSolutionId(programId) || !validSolutionId(solutionId)) {
            this.loading.set(false);
            this.error.set({
              code: "not_found",
              detail: "Решение не найдено.",
              errors: [],
              meta: {},
            });
            return EMPTY;
          }
          return this.get
            .execute(programId, solutionId)
            .pipe(map(result => ({ result, preserve })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ result, preserve }) => {
        this.loading.set(false);
        if (result.ok) this.hydrate(result.value, preserve);
        else {
          this.frame.set(null);
          this.form.reset({});
          this.previous.set([]);
          this.error.set(result.error);
        }
      });
  }

  reload(preserve = false): void {
    if (!this.busy()) this.retry.next(preserve);
  }
  private valuesFor(frame: SolutionRatingFrame): Values {
    return Object.fromEntries(
      frame.criteria.map(c => [
        String(c.id),
        c.type === "bool"
          ? c.value === null
            ? null
            : c.value === "True"
          : c.type === "str"
            ? (c.value ?? "")
            : c.value === null || c.value === ""
              ? null
              : Number(c.value),
      ]),
    );
  }
  private hydrate(frame: SolutionRatingFrame, preserve: boolean): void {
    const old = this.frame();
    const values = this.valuesFor(frame);
    const local = this.form.getRawValue();
    const previous: { name: string; value: string }[] = [];
    if (preserve && old) {
      for (const criterion of old.criteria) {
        const current = frame.criteria.find(
          c => c.id === criterion.id && c.type === criterion.type,
        );
        if (current && frame.canRate) values[String(criterion.id)] = local[String(criterion.id)];
        else if (
          !this.sameValue(local[String(criterion.id)], this.valuesFor(old)[String(criterion.id)])
        )
          previous.push({ name: criterion.name, value: this.text(local[String(criterion.id)]) });
      }
    }
    this.previous.set(previous);
    this.frame.set(frame);
    this.materials.set(
      new FormGroup(
        Object.fromEntries(
          frame.solution.answers.map(a => [String(a.fieldId), new FormControl(a.value)]),
        ),
      ),
    );
    this.form.reset(values);
    if (frame.canRate) this.form.enable({ emitEvent: false });
    else this.form.disable({ emitEvent: false });
    this.editing.set(frame.canRate && (!frame.isCompleted || preserve));
    this.saveError.set(null);
  }
  text(value: unknown): string {
    return value === false
      ? "Нет"
      : value === true
        ? "Да"
        : value === null || value === undefined || value === ""
          ? "Не указано"
          : String(value);
  }
  private sameValue(left: unknown, right: unknown): boolean {
    return (left ?? "") === (right ?? "");
  }
  hasUnsavedChanges(): boolean {
    const frame = this.frame();
    if (!frame || !this.editing()) return false;
    const original = this.valuesFor(frame),
      current = this.form.getRawValue();
    return frame.criteria.some(c => !this.sameValue(original[String(c.id)], current[String(c.id)]));
  }
  prepare(): void {
    if (this.busy() || !this.frame()?.canRate || this.saveError()?.code === "criteria_changed")
      return;
    if (!this.renderer()?.validateAndFocus()) return;
    this.confirmation.set(true);
  }
  closeConfirmation(): void {
    if (!this.busy()) this.confirmation.set(false);
  }
  confirm(): void {
    const frame = this.frame();
    if (!frame || !frame.canRate || !this.confirmation() || this.busy()) return;
    this.busy.set(true);
    this.form.disable({ emitEvent: false });
    this.saveError.set(null);
    const values = this.form.getRawValue();
    const scores = frame.criteria.map(c => ({
      criterionId: c.id,
      value:
        c.type === "str"
          ? String(values[String(c.id)] ?? "")
          : values[String(c.id)] === null ||
              values[String(c.id)] === undefined ||
              values[String(c.id)] === ""
            ? null
            : c.type === "bool"
              ? values[String(c.id)]
                ? "True"
                : "False"
              : String(Number(values[String(c.id)])),
    }));
    this.rate
      .execute(this.context.programId, this.context.solutionId, {
        expectedCriteriaRevision: frame.criteriaRevision,
        scores,
      })
      .pipe(takeUntil(this.contextChanged), takeUntilDestroyed(this.destroy))
      .subscribe(result => {
        this.busy.set(false);
        if (this.frame()?.canRate) this.form.enable({ emitEvent: false });
        this.confirmation.set(false);
        if (result.ok) {
          this.hydrate(result.value, false);
          this.editing.set(false);
        } else {
          this.saveError.set(
            ["network", "server_error"].includes(result.error.code)
              ? {
                  ...result.error,
                  detail:
                    "Не удалось сохранить оценку. Ответы остались в форме. Попробуйте еще раз.",
                }
              : result.error,
          );
          if (
            [
              "not_found",
              "forbidden",
              "not_assigned",
              "permission_denied",
              "unauthorized",
              "authentication_required",
            ].includes(result.error.code)
          ) {
            this.error.set(result.error);
            this.frame.set(null);
            this.form.reset({});
            this.previous.set([]);
          } else if (
            ["evaluation_closed", "max_rates_reached", "own_team"].includes(result.error.code)
          )
            this.reload(true);
        }
      });
  }
  edit(): void {
    if (this.frame()?.canRate && !this.busy()) this.editing.set(true);
  }
  canLeave(): boolean | Promise<boolean> {
    if (this.busy()) return false;
    if (!this.hasUnsavedChanges()) return true;
    if (this.resolveLeave) return false;
    this.confirmation.set(false);
    this.leaveOpen.set(true);
    return new Promise(resolve => {
      this.resolveLeave = resolve;
    });
  }
  answerLeave(value: boolean): void {
    this.leaveOpen.set(false);
    this.resolveLeave?.(value);
    this.resolveLeave = undefined;
  }
  @HostListener("window:beforeunload", ["$event"])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.busy() || this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
}
