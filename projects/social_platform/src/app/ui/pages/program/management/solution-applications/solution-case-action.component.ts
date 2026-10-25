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
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, takeUntil } from "rxjs";
import {
  PreviewSolutionCaseChangeUseCase,
  ApplySolutionCaseChangeUseCase,
} from "@api/solution/use-cases/solution-case-actions.use-cases";
import { SolutionCaseChangePreview } from "@domain/solution/solution-contract.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ButtonDirective, FieldDirective } from "@uilib";

export interface SolutionCaseRequest {
  programId: number;
  solutionId: number;
  name: string;
}

@Component({
  selector: "app-solution-case-action",
  imports: [ReactiveFormsModule, ModalComponent, ButtonDirective, FieldDirective],
  templateUrl: "./solution-case-action.component.html",
  styleUrl: "./solution-applications.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionCaseActionComponent {
  readonly request = input<SolutionCaseRequest | null>(null);
  readonly caseOptions = input<string[]>([]);
  readonly closed = output<void>();
  readonly completed = output<void>();
  readonly busyChange = output<boolean>();
  readonly caseControl = new FormControl("", { nonNullable: true });
  readonly preview = signal<SolutionCaseChangePreview | null>(null);
  readonly loading = signal(false);
  readonly applying = signal(false);
  readonly error = signal<string | null>(null);
  readonly canApply = computed(() => {
    const checked = this.preview(),
      request = this.request();
    return (
      !!request &&
      !!checked?.canApply &&
      !!checked.previewToken &&
      checked.application.programId === request.programId &&
      checked.application.solutionId === request.solutionId &&
      !this.loading() &&
      !this.applying()
    );
  });
  private readonly getPreview = inject(PreviewSolutionCaseChangeUseCase);
  private readonly apply = inject(ApplySolutionCaseChangeUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelled = new Subject<void>();
  private sequence = 0;

  constructor() {
    effect(() => {
      this.request();
      untracked(() => {
        this.sequence++;
        this.cancelled.next();
        this.caseControl.reset("", { emitEvent: false });
        this.preview.set(null);
        this.error.set(null);
        this.loading.set(false);
      });
    });
    this.caseControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.refresh());
  }
  refresh(): void {
    const request = this.request(),
      caseName = this.caseControl.value;
    const sequence = ++this.sequence;
    this.cancelled.next();
    this.preview.set(null);
    this.error.set(null);
    this.loading.set(false);
    if (!request || !caseName || this.applying()) return;
    this.loading.set(true);
    this.getPreview
      .execute(request.programId, request.solutionId, { caseName })
      .pipe(takeUntil(this.cancelled), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (
          sequence !== this.sequence ||
          this.request() !== request ||
          this.caseControl.value !== caseName
        )
          return;
        this.loading.set(false);
        if (result.ok) this.preview.set(result.value);
        else this.error.set(result.error.detail);
      });
  }
  confirm(): void {
    const request = this.request(),
      checked = this.preview();
    if (
      !request ||
      !checked ||
      !this.canApply() ||
      checked.caseName !== this.caseControl.value ||
      checked.application.solutionId !== request.solutionId ||
      checked.application.programId !== request.programId
    )
      return;
    this.applying.set(true);
    this.busyChange.emit(true);
    this.apply
      .execute(request.programId, request.solutionId, {
        caseName: checked.caseName,
        previewToken: checked.previewToken!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.applying.set(false);
        this.busyChange.emit(false);
        this.preview.set(null);
        if (this.request() !== request) return;
        if (result.ok) this.completed.emit();
        else this.error.set(result.error.detail);
      });
  }
  close(): void {
    if (this.applying()) return;
    this.sequence++;
    this.cancelled.next();
    this.closed.emit();
  }
}
