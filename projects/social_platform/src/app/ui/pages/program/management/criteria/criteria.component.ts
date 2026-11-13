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
import { HttpErrorResponse } from "@angular/common/http";
import { userErrorMessage } from "@core/lib/models/error/user-error-message";
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import {
  CriterionType,
  EvaluationScoringMode,
  ManagementCriteria,
  ManagementCriteriaWrite,
  ManagementCriterion,
} from "@domain/program/program-criteria.model";
import { AlertDirective, ButtonDirective, ChoiceDirective, FieldDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";

import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";

@Component({
  selector: "app-management-criteria",
  imports: [
    TransientNoticeComponent,
    ReactiveFormsModule,
    FormsModule,
    ChoiceDirective,
    AlertDirective,
    ButtonDirective,
    FieldDirective,
    ModalComponent,
  ],
  templateUrl: "./criteria.component.html",
  styleUrl: "./criteria.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementCriteriaComponent {
  readonly programId = input.required<number>();
  readonly confirmDiscard = input.required<() => Promise<boolean>>();
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  readonly savedAt = output<string>();
  private readonly api = inject(ProgramManagementUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly snapshot = signal<ManagementCriteria | null>(null);
  readonly criteria = signal<ManagementCriterion[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly conflict = signal<"criteria_locked" | "stale_criteria" | null>(null);
  readonly conflictOpen = signal(false);
  readonly saved = signal(false, { equal: () => false });
  readonly editing = signal<ManagementCriterion | "new" | null>(null);
  readonly editorDirty = signal(false);
  readonly editorError = signal<string | null>(null);
  readonly editor = this.fb.group({
    name: ["", [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
    description: ["", Validators.maxLength(4000)],
    type: this.fb.control<CriterionType>("int"),
    minValue: new FormControl<number | null>(0),
    maxValue: new FormControl<number | null>(10),
    weightPercent: new FormControl<number | null>(null),
  });
  readonly editorType = signal<CriterionType>("int");
  readonly scoringMode = signal<EvaluationScoringMode>("legacy");
  readonly weightTotal = computed(
    () =>
      this.criteria()
        .filter(c => c.type === "int" || c.type === "float")
        .reduce((total, c) => total + Math.round((c.weightPercent ?? 0) * 100), 0) / 100,
  );
  readonly weightsError = computed(() => {
    if (this.scoringMode() !== "weighted_percent") return null;
    const numeric = this.criteria().filter(c => c.type === "int" || c.type === "float");
    if (!numeric.length) return "Добавьте числовой критерий и распределите 100% веса.";
    if (numeric.some(c => !this.validWeight(c.weightPercent)))
      return "Укажите вес каждого числового критерия: от 0,01 до 100%, до двух знаков после запятой.";
    if (
      numeric.some(
        c =>
          c.minValue === null ||
          c.maxValue === null ||
          !Number.isFinite(c.minValue) ||
          !Number.isFinite(c.maxValue) ||
          c.maxValue <= c.minValue,
      )
    )
      return "Для весов укажите конечный максимум строго больше минимума каждого числового критерия.";
    return this.weightTotal() === 100 ? null : "Сумма весов должна быть ровно 100%.";
  });
  readonly deleting = signal<ManagementCriterion | null>(null);
  readonly labels: Record<CriterionType, string> = {
    int: "Целые баллы",
    bool: "Да / нет",
    str: "Текстовый комментарий",
    float: "Дробные баллы (существующий критерий)",
  };
  readonly locked = computed(
    () => !!this.snapshot()?.locked || this.conflict() === "criteria_locked",
  );
  readonly dirty = computed(() => {
    const original = this.snapshot();
    return (
      !!original &&
      (JSON.stringify(this.body()) !== JSON.stringify(this.body(original)) || this.editorDirty())
    );
  });
  private nextId = -1;
  private request = 0;

  constructor() {
    effect(() => {
      const id = this.programId();
      untracked(() => this.load(id));
    });
    effect(() =>
      this.statusChange.emit({ dirty: this.dirty(), busy: this.loading() || this.saving() }),
    );
    this.editor.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.editorDirty.set(this.editor.dirty);
      this.editorType.set(this.editor.controls.type.value);
    });
  }
  private body(source?: ManagementCriteria): ManagementCriteriaWrite {
    const snapshot = source ?? this.snapshot();
    return {
      expectedUpdatedAt: snapshot?.updatedAt ?? "",
      expectedRevision: snapshot?.revision ?? "",
      scoringMode: source ? (source.scoringMode ?? "legacy") : this.scoringMode(),
      criteria: (source?.criteria ?? this.criteria()).map(c => ({
        ...c,
        id: c.id > 0 ? c.id : null,
        weightPercent:
          (source ? source.scoringMode : this.scoringMode()) === "weighted_percent"
            ? (c.weightPercent ?? null)
            : null,
      })),
    };
  }
  load(id = this.programId()): void {
    const request = ++this.request;
    this.loading.set(true);
    this.error.set(null);
    this.api
      .criteria(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: snapshot => {
          if (request !== this.request) return;
          this.snapshot.set(snapshot);
          this.discard();
          this.loading.set(false);
        },
        error: (e: HttpErrorResponse) => {
          if (request !== this.request) return;
          this.error.set(this.errorText(e));
          this.loading.set(false);
        },
      });
  }
  async reload(): Promise<void> {
    if (this.saving() || (this.dirty() && !(await this.confirmDiscard()()))) return;
    this.load();
  }
  discard(): void {
    this.scoringMode.set(this.snapshot()?.scoringMode ?? "legacy");
    this.criteria.set(this.snapshot()?.criteria.map(c => ({ ...c })) ?? []);
    this.editing.set(null);
    this.editorDirty.set(false);
    this.error.set(null);
    this.conflict.set(null);
    this.conflictOpen.set(false);
    this.saved.set(false);
  }
  async cancel(): Promise<void> {
    if (!this.dirty() || (await this.confirmDiscard()())) this.discard();
  }
  edit(criterion?: ManagementCriterion): void {
    if (
      this.locked() ||
      this.saving() ||
      (criterion?.type === "float" && this.scoringMode() !== "weighted_percent")
    )
      return;
    this.editing.set(criterion ?? "new");
    this.editor.reset({
      name: criterion?.name ?? "",
      description: criterion?.description ?? "",
      type: criterion?.type ?? "int",
      minValue: criterion?.minValue ?? 0,
      maxValue: criterion?.maxValue ?? 10,
      weightPercent: criterion?.weightPercent ?? null,
    });
    for (const [key, control] of Object.entries(this.editor.controls)) {
      if (criterion?.type === "float" && key !== "weightPercent")
        control.disable({ emitEvent: false });
      else control.enable({ emitEvent: false });
    }
    this.editorType.set(this.editor.controls.type.value);
    this.editorDirty.set(false);
    this.editorError.set(null);
    this.saved.set(false);
  }
  async closeEditor(): Promise<void> {
    if (this.editorDirty() && !(await this.confirmDiscard()())) return;
    this.editing.set(null);
    this.editorDirty.set(false);
  }
  apply(): void {
    const editing = this.editing();
    if (!editing || this.locked()) return;
    const value = this.editor.getRawValue();
    this.editor.markAllAsTouched();
    if (this.editor.invalid) {
      this.editorError.set("Укажите название до 50 символов и описание до 4000 символов.");
      return;
    }
    if (
      this.scoringMode() === "weighted_percent" &&
      (value.type === "int" || value.type === "float") &&
      !this.validWeight(value.weightPercent)
    ) {
      this.editorError.set("Укажите вес от 0,01 до 100%, до двух знаков после запятой.");
      return;
    }
    if (
      value.type === "int" &&
      (value.minValue === null ||
        value.maxValue === null ||
        !Number.isSafeInteger(value.minValue) ||
        !Number.isSafeInteger(value.maxValue) ||
        value.minValue > value.maxValue)
    ) {
      this.editorError.set("Укажите целые минимум и максимум. Максимум не меньше минимума.");
      return;
    }
    const criterion: ManagementCriterion = {
      ...value,
      name: value.name.trim(),
      id: editing === "new" ? this.nextId-- : editing.id,
      minValue: value.type === "int" ? value.minValue : null,
      maxValue: value.type === "int" ? value.maxValue : null,
      weightPercent: value.type === "int" || value.type === "float" ? value.weightPercent : null,
    };
    if (editing !== "new" && editing.type === "float")
      Object.assign(criterion, editing, { weightPercent: value.weightPercent });
    this.criteria.update(rows =>
      editing === "new"
        ? [...rows, criterion]
        : rows.map(c => (c.id === criterion.id ? criterion : c)),
    );
    this.editing.set(null);
    this.editorDirty.set(false);
  }
  remove(): void {
    const criterion = this.deleting();
    if (!criterion || this.locked() || this.saving()) return;
    this.criteria.update(rows => rows.filter(c => c.id !== criterion.id));
    this.deleting.set(null);
    this.saved.set(false);
  }
  save(): void {
    if (!this.snapshot() || this.locked() || this.saving() || !this.dirty()) return;
    if (this.weightsError()) {
      this.error.set(this.weightsError());
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);
    this.api
      .saveCriteria(this.programId(), this.body())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.snapshot.set(data);
          this.discard();
          this.saved.set(true);
          this.saving.set(false);
          this.savedAt.emit(data.updatedAt);
        },
        error: (e: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(this.errorText(e));
          if (e.status === 409) {
            const code = e.error?.code === "criteria_locked" ? "criteria_locked" : "stale_criteria";
            this.conflict.set(code);
            if (code === "criteria_locked")
              this.snapshot.update(s => (s ? { ...s, locked: true } : s));
            this.conflictOpen.set(code === "criteria_locked");
          }
        },
      });
  }
  summary(c: ManagementCriterion): string {
    if (c.type === "str") return "Текстовый ответ. Не влияет на баллы.";
    if (c.type === "bool") return "Да / нет. Не влияет на баллы.";
    return `${this.labels[c.type]} · от ${c.minValue ?? "без минимума"} до ${c.maxValue ?? "без максимума"}`;
  }
  changeScoringMode(event: Event): void {
    if (this.locked() || this.saving()) return;
    this.scoringMode.set(
      (event.target as HTMLInputElement).checked ? "weighted_percent" : "legacy",
    );
    this.error.set(null);
    this.saved.set(false);
  }
  changeWeight(criterion: ManagementCriterion, weightPercent: number | null): void {
    if (this.locked() || this.saving() || this.scoringMode() !== "weighted_percent") return;
    this.criteria.update(rows =>
      rows.map(c => (c.id === criterion.id ? { ...c, weightPercent } : c)),
    );
    this.error.set(null);
    this.saved.set(false);
  }
  invalidWeight(criterion: ManagementCriterion): boolean {
    return !this.validWeight(criterion.weightPercent);
  }
  private validWeight(value: number | null | undefined): value is number {
    return (
      value != null &&
      Number.isFinite(value) &&
      value >= 0.01 &&
      value <= 100 &&
      Math.abs(value - Math.round(value * 100) / 100) < 1e-9
    );
  }
  private errorText(e: HttpErrorResponse): string {
    if (e.status === 403 || e.status === 401)
      return "Нет доступа к управлению критериями этой программы.";
    if (e.status === 409)
      return userErrorMessage(e.error?.detail, "Критерии изменились. Обновите данные.");
    return e.status === 400
      ? this.scoringMode() === "weighted_percent"
        ? "Проверьте названия, шкалы и веса критериев. Сумма весов должна быть 100%. Изменения не сохранены."
        : "Проверьте названия, типы и шкалы критериев. Изменения не сохранены."
      : "Не удалось загрузить или сохранить критерии. Попробуйте еще раз.";
  }
}
