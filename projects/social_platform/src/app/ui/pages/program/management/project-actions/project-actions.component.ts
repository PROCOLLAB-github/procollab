/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, finalize, takeUntil } from "rxjs";
import { AlertDirective, ButtonDirective, FieldDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import {
  ManagementProjectAction,
  ManagementProjectActionPreview,
  ManagementProjectActionResult,
  ManagementProjectActionWrite,
} from "@domain/program/program-management.model";

export interface ProjectActionRequest {
  programId: number;
  action: ManagementProjectAction;
  ids: number[];
  projectName?: string;
}
export interface ProjectActionDone extends ManagementProjectActionResult {
  programId: number;
  action: ManagementProjectAction;
}

@Component({
  selector: "app-management-project-actions",
  templateUrl: "./project-actions.component.html",
  styleUrl: "./project-actions.component.scss",
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    AlertDirective,
    ButtonDirective,
    FieldDirective,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementProjectActionsComponent {
  readonly request = input<ProjectActionRequest | null>(null);
  readonly caseOptions = input<string[]>([]);
  readonly closed = output<void>();
  readonly completed = output<ProjectActionDone>();
  readonly busyChange = output<boolean>();
  readonly caseControl = new FormControl("", { nonNullable: true });
  readonly preview = signal<ManagementProjectActionPreview | null>(null);
  readonly loading = signal(false);
  readonly applying = signal(false);
  readonly error = signal<string | null>(null);
  readonly blocked = computed(() => this.preview()?.items.filter(item => item.errors.length) ?? []);
  readonly title = computed(
    () =>
      ({
        change_case: "Сменить кейс",
        detach: "Открепить проект от программы",
        submit:
          this.request()?.ids.length === 1
            ? "Сдать решение за участника"
            : "Сдать решения за участников",
      })[this.request()?.action ?? "submit"],
  );
  readonly confirmLabel = computed(
    () =>
      ({ change_case: "Сменить кейс", detach: "Открепить проект", submit: "Сдать решения" })[
        this.request()?.action ?? "submit"
      ],
  );
  private readonly api = inject(ProgramManagementUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelled = new Subject<void>();
  private sequence = 0;
  private previewBody: ManagementProjectActionWrite | null = null;

  constructor() {
    effect(() => {
      const request = this.request();
      untracked(() => {
        this.sequence++;
        this.cancelled.next();
        this.preview.set(null);
        this.previewBody = null;
        this.error.set(null);
        this.loading.set(false);
        this.caseControl.reset("", { emitEvent: false });
        if (request && request.action !== "change_case") this.loadPreview();
      });
    });
    this.caseControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadPreview());
  }

  close(): void {
    if (this.applying()) return;
    this.sequence++;
    this.cancelled.next();
    this.closed.emit();
  }

  loadPreview(): void {
    const request = this.request();
    if (!request || this.applying()) return;
    const sequence = ++this.sequence;
    this.cancelled.next();
    this.preview.set(null);
    this.previewBody = null;
    this.error.set(null);
    this.loading.set(false);
    if (request.action === "change_case" && !this.caseControl.value) return;
    const body: ManagementProjectActionWrite = { action: request.action, ids: [...request.ids] };
    if (request.action === "change_case") body.caseName = this.caseControl.value;
    this.loading.set(true);
    this.api
      .previewProjectAction(request.programId, body)
      .pipe(
        takeUntil(this.cancelled),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (sequence === this.sequence) this.loading.set(false);
        }),
      )
      .subscribe({
        next: preview => {
          if (sequence !== this.sequence) return;
          this.previewBody = body;
          this.preview.set(preview);
        },
        error: (e: HttpErrorResponse) => {
          if (sequence === this.sequence) this.error.set(this.errorText(e));
        },
      });
  }

  confirm(): void {
    const request = this.request(),
      preview = this.preview(),
      body = this.previewBody;
    if (
      !request ||
      !body ||
      !preview?.canApply ||
      !preview.previewToken ||
      this.applying() ||
      this.loading()
    )
      return;
    this.applying.set(true);
    this.busyChange.emit(true);
    this.error.set(null);
    const sequence = this.sequence;
    this.api
      .applyProjectAction(request.programId, { ...body, previewToken: preview.previewToken })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.applying.set(false);
          this.busyChange.emit(false);
        }),
      )
      .subscribe({
        next: result => {
          if (sequence === this.sequence)
            this.completed.emit({
              ...result,
              action: request.action,
              programId: request.programId,
            });
        },
        error: (e: HttpErrorResponse) => {
          if (sequence !== this.sequence) return;
          this.preview.set(null);
          this.previewBody = null;
          this.error.set(this.errorText(e));
        },
      });
  }

  private errorText(error: HttpErrorResponse): string {
    if (error.status === 401 || error.status === 403)
      return "Нет доступа к действиям с проектами этой программы.";
    if (error.status === 404) return "Проект больше не связан с этой программой. Обновите список.";
    if (typeof error.error?.detail === "string") return error.error.detail;
    return "Не удалось проверить или выполнить действие. Повторите проверку.";
  }
}
