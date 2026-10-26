/** @format */

import { DestroyRef, Injectable, computed, inject, signal } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, of, Subject, takeUntil, tap } from "rxjs";
import {
  ProgramSolution,
  SolutionApiError,
  UpdateSolutionCommand,
  SolutionIssue,
} from "@domain/solution/solution-contract.model";
import { fail } from "@domain/shared/result.type";
import { hasSolutionAnswer } from "@domain/solution/solution-values";
import { solutionFieldsGroup, SolutionControlValue } from "@utils/solution-field-controls";
import {
  UpdateSolutionUseCase,
  UploadSolutionFileUseCase,
  SubmitSolutionUseCase,
} from "../use-cases/solution-draft.use-cases";

export type LocalSolutionAnswer = { fieldId: number; label: string; value: SolutionControlValue };
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

@Injectable()
export class SolutionDraftFacade {
  private readonly update = inject(UpdateSolutionUseCase);
  private readonly files = inject(UploadSolutionFileUseCase);
  private readonly submission = inject(SubmitSolutionUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contextChanged = new Subject<void>();
  private readonly controlsChanged = new Subject<void>();
  private key = "";
  private readonly tick = signal(0);
  readonly source = signal<ProgramSolution | null>(null);
  readonly group = signal(solutionFieldsGroup([]));
  readonly name = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(256)],
  });
  readonly saving = signal(false);
  readonly submitting = signal(false);
  readonly uploading = signal<number | null>(null);
  readonly busy = computed(() => this.saving() || this.submitting() || this.uploading() !== null);
  readonly attempted = signal(false);
  readonly fieldErrors = signal<Record<number, string>>({});
  readonly nameError = signal("");
  readonly error = signal<SolutionApiError | null>(null);
  readonly notice = signal("");
  readonly orphaned = signal<LocalSolutionAnswer[]>([]);
  readonly canEdit = computed(() => this.source()?.permissions.canEdit === true);
  readonly displayGroup = computed(() =>
    this.canEdit()
      ? this.group()
      : solutionFieldsGroup(this.source()?.form.fields ?? [], this.source()?.answers ?? []),
  );
  readonly dirty = computed(() => {
    this.tick();
    const source = this.source();
    if (!source) return false;
    return (
      this.name.value !== source.name ||
      this.orphaned().length > 0 ||
      source.form.fields.some(
        field =>
          !equal(
            this.group().get(String(field.id))?.value ?? null,
            this.serverValue(source, field.id),
          ),
      )
    );
  });
  readonly localChanges = computed(() => {
    this.tick();
    const source = this.source();
    if (!source) return [];
    return source.form.fields.flatMap(field => {
      const value = this.group().get(String(field.id))?.value ?? null;
      return equal(value, this.serverValue(source, field.id))
        ? []
        : [{ fieldId: field.id, label: field.label, value }];
    });
  });
  constructor() {
    this.name.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.tick.update(value => value + 1);
      this.nameError.set("");
    });
  }
  private serverValue(source: ProgramSolution, fieldId: number): SolutionControlValue {
    return source.answers.find(answer => answer.fieldId === fieldId)?.value ?? null;
  }
  clear() {
    this.contextChanged.next();
    this.controlsChanged.next();
    this.key = "";
    this.source.set(null);
    this.group.set(solutionFieldsGroup([]));
    this.name.reset("", { emitEvent: false });
    this.orphaned.set([]);
    this.error.set(null);
    this.fieldErrors.set({});
    this.nameError.set("");
    this.notice.set("");
    this.attempted.set(false);
    this.tick.update(value => value + 1);
  }
  hydrate(incoming: ProgramSolution, saved = false): boolean {
    const previous = this.source(),
      key = incoming.programId + ":" + incoming.id;
    if (previous && this.key === key && incoming.version < previous.version) return false;
    if (!saved && incoming === previous) return true;
    if (this.key !== key) {
      this.clear();
      this.key = key;
    }
    this.controlsChanged.next();
    const preserve =
      !saved && previous !== null && this.key === previous.programId + ":" + previous.id;
    const group = solutionFieldsGroup(incoming.form.fields, incoming.answers);
    const orphans = new Map((preserve ? this.orphaned() : []).map(item => [item.fieldId, item]));
    if (preserve) {
      for (const oldField of previous.form.fields) {
        const control = this.group().get(String(oldField.id));
        if (!control) continue;
        if (equal(control.value, this.serverValue(previous, oldField.id))) continue;
        const nextField = incoming.form.fields.find(field => field.id === oldField.id);
        if (!nextField || nextField.type !== oldField.type) {
          if (hasSolutionAnswer(control.value))
            orphans.set(oldField.id, {
              fieldId: oldField.id,
              label: oldField.label,
              value: control.value,
            });
          continue;
        }
        const next = group.get(String(oldField.id))!;
        next.setValue(control.value, { emitEvent: false });
        next.markAsDirty();
        if (control.touched) next.markAsTouched();
      }
    }
    if (!preserve || this.name.value === previous.name)
      this.name.reset(incoming.name, { emitEvent: false });
    this.source.set(incoming);
    this.group.set(group);
    this.orphaned.set([...orphans.values()]);
    for (const field of incoming.form.fields) {
      group
        .get(String(field.id))!
        .valueChanges.pipe(takeUntil(this.controlsChanged), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.fieldErrors.update(errors => {
            const next = { ...errors };
            delete next[field.id];
            return next;
          });
          this.tick.update(value => value + 1);
        });
    }
    if (saved) {
      this.error.set(null);
      this.fieldErrors.set({});
      this.nameError.set("");
      this.attempted.set(false);
      this.notice.set(
        incoming.submission.status === "submitted" ? "Решение сдано." : "Черновик сохранен.",
      );
    }
    this.tick.update(value => value + 1);
    return true;
  }
  discard() {
    const source = this.source();
    if (source) this.hydrate(source, true);
    this.notice.set("");
  }
  resolveLocalCopy(fieldId: number) {
    this.orphaned.update(items => items.filter(item => item.fieldId !== fieldId));
  }
  reconciled() {
    if (!this.dirty()) this.error.set(null);
    this.notice.set(
      this.dirty()
        ? "Данные обновлены. Ваши правки сохранены локально; проверьте их и повторите действие."
        : "Данные обновлены.",
    );
  }
  private localError(code: string, detail: string): SolutionApiError {
    return { code, detail, errors: [], meta: {} };
  }
  private report(error: SolutionApiError) {
    this.error.set(error);
    this.nameError.set("");
    const fields: Record<number, string> = {};
    for (const issue of error.errors) {
      if (issue.fieldId !== null) fields[issue.fieldId] = issue.detail;
      else if (issue.path === "name") this.nameError.set(issue.detail);
    }
    this.fieldErrors.set(fields);
  }
  showIssues(issues: SolutionIssue[]) {
    this.attempted.set(true);
    this.report({
      code: "required_program_fields",
      detail: "Проверьте решение и состав команды перед сдачей.",
      errors: issues,
      meta: {},
    });
  }
  submit(checkpoint: ProgramSolution) {
    if (this.busy() || this.key !== checkpoint.programId + ":" + checkpoint.id || !this.canEdit())
      return of(fail(this.localError("permission_denied", "Сдача сейчас недоступна.")));
    this.submitting.set(true);
    this.error.set(null);
    this.notice.set("");
    return this.submission
      .execute(checkpoint.programId, checkpoint.id, {
        expectedVersion: checkpoint.version,
        expectedFormRevision: checkpoint.form.revision,
      })
      .pipe(
        takeUntil(this.contextChanged),
        takeUntilDestroyed(this.destroyRef),
        tap(result => {
          if (result.ok) this.hydrate(result.value, true);
          else this.report(result.error);
        }),
        finalize(() => this.submitting.set(false)),
      );
  }
  save() {
    const source = this.source();
    this.attempted.set(true);
    this.name.markAsTouched();
    this.group().markAllAsTouched();
    this.notice.set("");
    if (!source || !this.canEdit() || this.busy())
      return of(fail(this.localError("permission_denied", "Сохранение сейчас недоступно.")));
    if (this.name.invalid || this.group().invalid || this.orphaned().length) {
      const error = this.localError(
        "invalid_answers",
        "Проверьте поля решения и несохраненные ответы измененной формы.",
      );
      this.report(error);
      if (this.name.invalid) this.nameError.set("Укажите название не длиннее 256 символов.");
      return of(fail(error));
    }
    const command: UpdateSolutionCommand = {
      expectedVersion: source.version,
      expectedFormRevision: source.form.revision,
      name: this.name.value,
      answers: source.form.fields
        .filter(
          field =>
            !equal(this.group().get(String(field.id))!.value, this.serverValue(source, field.id)),
        )
        .map(field => ({ fieldId: field.id, value: this.group().get(String(field.id))!.value })),
    };
    const key = this.key;
    this.saving.set(true);
    this.error.set(null);
    return this.update.execute(source.programId, source.id, command).pipe(
      takeUntil(this.contextChanged),
      takeUntilDestroyed(this.destroyRef),
      tap(result => {
        if (key !== this.key) return;
        if (result.ok) this.hydrate(result.value, true);
        else this.report(result.error);
      }),
      finalize(() => this.saving.set(false)),
    );
  }
  clearFile(fieldId: number) {
    if (!this.canEdit() || this.busy()) return;
    const control = this.group().get(String(fieldId));
    control?.setValue(null);
    control?.markAsDirty();
    this.tick.update(value => value + 1);
  }
  upload(fieldId: number, file: File) {
    const source = this.source(),
      field = source?.form.fields.find(field => field.id === fieldId);
    if (!source || !field || field.type !== "file" || !this.canEdit() || this.busy()) return;
    const maximum = Math.min(field.validation.maxFileSizeBytes ?? 104857600, 104857600);
    const extension = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    let detail = "";
    if (file.size > maximum) detail = "Файл превышает допустимый размер.";
    else if (
      field.validation.allowedExtensions.length &&
      !field.validation.allowedExtensions.includes(extension)
    )
      detail = "Выберите разрешенный тип файла.";
    if (detail) {
      this.fieldErrors.update(errors => ({ ...errors, [fieldId]: detail }));
      return;
    }
    this.uploading.set(fieldId);
    this.error.set(null);
    this.notice.set("");
    const key = this.key;
    this.files
      .execute(file)
      .pipe(
        takeUntil(this.contextChanged),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.uploading.set(null)),
      )
      .subscribe(result => {
        if (key !== this.key) return;
        if (!result.ok) {
          this.fieldErrors.update(errors => ({ ...errors, [fieldId]: result.error.detail }));
          return;
        }
        const current = this.source()?.form.fields.find(next => next.id === fieldId);
        if (!this.canEdit() || !current || current.type !== "file") {
          this.orphaned.update(items => [
            ...items.filter(item => item.fieldId !== fieldId),
            { fieldId, label: field.label, value: result.value },
          ]);
          this.error.set(
            this.localError(
              "form_revision_conflict",
              "Форма или права изменились. Загруженный файл сохранен в локальном ответе.",
            ),
          );
          return;
        }
        const control = this.group().get(String(fieldId))!;
        control.setValue(result.value);
        control.markAsDirty();
        this.tick.update(value => value + 1);
        this.notice.set("Файл загружен. Сохраните черновик, чтобы добавить его в решение.");
      });
  }
  valueText(value: SolutionControlValue): string {
    if (value === null) return "Ответ очищен";
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    return typeof value === "object" ? value.url : String(value);
  }
}
