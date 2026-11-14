/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
  ElementRef,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import {
  AlertDirective,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
  PageHeaderComponent,
} from "@uilib";
import { AppRoutes } from "@api/paths/app-routes";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import {
  PROGRAM_FORMATS,
  ProgramCreation,
  ProgramFormat,
} from "@domain/program/program-launch.model";
import { evaluationError } from "@utils/evaluation-workspace";

const INTENT_KEY = "programCreationIntent:v1";
@Component({
  selector: "app-program-create",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertDirective,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    PageHeaderComponent,
  ],
  templateUrl: "./create.component.html",
  styleUrl: "./create.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCreateComponent {
  private readonly api = inject(ProgramLaunchUseCase);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly paths = AppRoutes;
  readonly returnPath = this.getReturnPath();
  formats = PROGRAM_FORMATS;
  readonly pending = signal(false);
  readonly loading = signal(true);
  readonly allowed = signal(false);
  readonly error = signal<string | null>(null);
  readonly nameInput = viewChild<ElementRef<HTMLInputElement>>("nameInput");
  readonly formatGroup = viewChild<ElementRef<HTMLElement>>("formatGroup");
  readonly form = this.fb.group({
    name: ["", [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    format: this.fb.control<ProgramFormat | null>(null, Validators.required),
  });
  private intent: ProgramCreation | null = null;
  constructor() {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(INTENT_KEY) ?? "null");
      if (
        saved &&
        typeof saved === "object" &&
        "name" in saved &&
        typeof saved.name === "string" &&
        "format" in saved &&
        (saved.format === "noncompetitive" || PROGRAM_FORMATS.some(f => f.id === saved.format)) &&
        "idempotencyKey" in saved &&
        typeof saved.idempotencyKey === "string" &&
        /^[a-f0-9-]{36}$/i.test(saved.idempotencyKey)
      ) {
        this.intent = saved as ProgramCreation;
        if (this.intent.format === "noncompetitive") {
          this.formats = [
            ...PROGRAM_FORMATS,
            {
              id: "noncompetitive",
              label: "Без конкурса",
              description: "Ранее выбранный формат для повторной отправки.",
            },
          ];
        }
        this.form.patchValue(this.intent);
      }
    } catch {
      /* An unavailable session store must not prevent creation. */
    }
    this.reloadCapability();
  }
  reloadCapability() {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .capabilities()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: value => this.allowed.set(value.canCreateProgram),
        error: e => this.error.set(evaluationError(e)),
      });
  }
  submit() {
    if (this.pending() || !this.allowed()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.controls.name.invalid) this.nameInput()?.nativeElement.focus();
      else this.formatGroup()?.nativeElement.querySelector("input")?.focus();
      return;
    }
    const value = this.form.getRawValue();
    if (!value.format) return;
    const name = value.name.trim();
    if (!this.intent || this.intent.name !== name || this.intent.format !== value.format) {
      this.intent = { name, format: value.format, idempotencyKey: crypto.randomUUID() };
    }
    try {
      sessionStorage.setItem(INTENT_KEY, JSON.stringify(this.intent));
    } catch {
      /* Retry still uses the in-memory key. */
    }
    this.pending.set(true);
    this.error.set(null);
    this.api
      .create(this.intent)
      .pipe(
        finalize(() => this.pending.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: program => {
          this.clearIntent();
          void this.router.navigateByUrl(this.paths.program.launch(program.id));
        },
        error: e => {
          if (e.status === 403) this.allowed.set(false);
          this.error.set(evaluationError(e));
        },
      });
  }
  cancel() {
    if (this.pending()) return;
    this.clearIntent();
    void this.router.navigateByUrl(this.returnPath);
  }
  canDeactivate(): boolean {
    return !this.pending();
  }
  private getReturnPath(): string {
    const state = this.router.getCurrentNavigation()?.extras.state ?? window.history.state;
    const path: unknown = state?.["returnUrl"];
    return typeof path === "string" && /^\/office\/program\/(all|managed)(?:\?[^#]*)?$/.test(path)
      ? path
      : this.paths.program.managed();
  }
  private clearIntent() {
    this.intent = null;
    try {
      sessionStorage.removeItem(INTENT_KEY);
    } catch {
      /* Optional storage. */
    }
  }
}
