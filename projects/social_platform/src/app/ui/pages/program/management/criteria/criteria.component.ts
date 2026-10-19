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
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import {
  CriterionType,
  ManagementCriteria,
  ManagementCriteriaWrite,
  ManagementCriterion,
} from "@domain/program/program-criteria.model";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { AlertDirective, ButtonDirective, FieldDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProjectRatingComponent } from "../../detail/list/rating-card/project-rating/project-rating.component";

@Component({
  selector: "app-management-criteria",
  imports: [
    ReactiveFormsModule,
    AlertDirective,
    ButtonDirective,
    FieldDirective,
    ModalComponent,
    ProjectRatingComponent,
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
  readonly saved = signal(false);
  readonly editing = signal<ManagementCriterion | "new" | null>(null);
  readonly editorDirty = signal(false);
  readonly editorError = signal<string | null>(null);
  readonly editor = this.fb.group({
    name: ["", [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
    description: ["", Validators.maxLength(4000)],
    type: this.fb.control<CriterionType>("int"),
    minValue: new FormControl<number | null>(0),
    maxValue: new FormControl<number | null>(10),
  });
  readonly editorType = signal<CriterionType>("int");
  readonly previewOpen = signal(false);
  readonly previewCriteria = signal<ProjectRatingCriterion[]>([]);
  readonly previewControl = new FormControl();
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
      criteria: (source?.criteria ?? this.criteria()).map(c => ({
        ...c,
        id: c.id > 0 ? c.id : null,
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
    if (this.locked() || this.saving() || criterion?.type === "float") return;
    this.editing.set(criterion ?? "new");
    this.editor.reset({
      name: criterion?.name ?? "",
      description: criterion?.description ?? "",
      type: criterion?.type ?? "int",
      minValue: criterion?.minValue ?? 0,
      maxValue: criterion?.maxValue ?? 10,
    });
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
    };
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
  openPreview(): void {
    this.previewCriteria.set(
      this.criteria().map(c => ({
        ...c,
        description: c.description ?? "",
        value: "",
        expertId: 0,
      })),
    );
    this.previewControl.reset();
    this.previewOpen.set(true);
  }
  summary(c: ManagementCriterion): string {
    return (
      this.labels[c.type] +
      (c.type === "int" || c.type === "float"
        ? ` · от ${c.minValue ?? "без минимума"} до ${c.maxValue ?? "без максимума"}`
        : "")
    );
  }
  private errorText(e: HttpErrorResponse): string {
    if (e.status === 403 || e.status === 401)
      return "Нет доступа к управлению критериями этой программы.";
    if (e.status === 409) return e.error?.detail ?? "Критерии изменились. Обновите данные.";
    return e.status === 400
      ? "Проверьте названия, типы и шкалы критериев. Изменения не сохранены."
      : "Не удалось загрузить или сохранить критерии. Попробуйте еще раз.";
  }
}
