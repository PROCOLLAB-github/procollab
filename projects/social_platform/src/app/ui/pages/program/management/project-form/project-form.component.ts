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
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import {
  AlertDirective,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
  IconComponent,
} from "@uilib";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import {
  ManagementCase,
  ManagementFormField,
  ManagementProjectForm,
  ManagementProjectFormWrite,
} from "@domain/program/program-project-form.model";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProgramFieldsComponent } from "@ui/widgets/program-fields/program-fields.component";
import { PROGRAM_FIELD_TYPE_LABELS, programFieldControl } from "@utils/program-field-controls";

import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";

@Component({
  selector: "app-management-project-form",
  templateUrl: "./project-form.component.html",
  styleUrl: "./project-form.component.scss",
  imports: [
    TransientNoticeComponent,
    ReactiveFormsModule,
    AlertDirective,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    IconComponent,
    ModalComponent,
    ProgramFieldsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementProjectFormComponent {
  readonly programId = input.required<number>();
  readonly confirmDiscard = input.required<() => Promise<boolean>>();
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  readonly savedAt = output<string>();
  readonly materials = output<void>();
  private readonly api = inject(ProgramManagementUseCase);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);
  readonly snapshot = signal<ManagementProjectForm | null>(null);
  readonly cases = signal<ManagementCase[]>([]);
  readonly fields = signal<ManagementFormField[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly conflict = signal(false);
  readonly saved = signal(false, { equal: () => false });
  readonly caseIndex = signal<number | null>(null); // -1 is new
  readonly caseName = this.fb.control("", [
    Validators.required,
    Validators.pattern(/\S/),
    Validators.maxLength(1000),
  ]);
  readonly caseError = signal<string | null>(null);
  readonly editing = signal<ManagementFormField | "new" | null>(null);
  readonly editorDirty = signal(false);
  readonly editorError = signal<string | null>(null);
  readonly editor = this.fb.group({
    label: ["", [Validators.required, Validators.pattern(/\S/), Validators.maxLength(256)]],
    fieldType: this.fb.control<PartnerProgramFields["fieldType"]>("text"),
    helpText: ["", Validators.maxLength(4000)],
    isRequired: [false],
    options: this.fb.array<FormControl<string>>([]),
  });
  readonly typeLabels = PROGRAM_FIELD_TYPE_LABELS;
  readonly previewOpen = signal(false);
  readonly previewFields = signal<PartnerProgramFields[]>([]);
  readonly previewForm = new FormGroup({});
  readonly previewAttempt = signal(0);
  readonly previewMessage = signal<string | null>(null);
  readonly previewInvalid = signal(false);
  readonly dirty = computed(() => {
    const original = this.snapshot();
    return (
      !!original &&
      (JSON.stringify(this.writeBody()) !== JSON.stringify(this.writeBody(original)) ||
        this.editorDirty() ||
        this.caseIndex() !== null)
    );
  });
  private newId = -10;
  private request = 0;

  constructor() {
    effect(() => {
      const id = this.programId();
      untracked(() => this.load(id));
    });
    effect(() =>
      this.statusChange.emit({ dirty: this.dirty(), busy: this.saving() || this.loading() }),
    );
    this.editor.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.editorDirty.set(this.editor.dirty));
  }
  private writeBody(source?: ManagementProjectForm): ManagementProjectFormWrite {
    const snapshot = source ?? this.snapshot();
    return {
      expectedUpdatedAt: snapshot?.updatedAt ?? "",
      expectedRevision: snapshot?.revision ?? "",
      cases: (source?.cases ?? this.cases()).map(c => c.name),
      fields: (source?.fields ?? this.fields()).map(f => ({
        id: f.id > 0 ? f.id : null,
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        helpText: f.helpText,
        options: f.options,
      })),
    };
  }
  private load(id: number): void {
    const request = ++this.request;
    this.loading.set(true);
    this.error.set(null);
    this.api
      .projectForm(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (request !== this.request) return;
          this.snapshot.set(data);
          this.discard();
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          if (request !== this.request) return;
          this.error.set(this.errorText(error));
          this.loading.set(false);
        },
      });
  }
  async reload(): Promise<void> {
    if (this.saving() || (this.dirty() && !(await this.confirmDiscard()()))) return;
    this.load(this.programId());
  }
  discard(): void {
    const snapshot = this.snapshot();
    this.cases.set(snapshot?.cases.map(c => ({ ...c })) ?? []);
    this.fields.set(snapshot?.fields.map(f => ({ ...f, options: [...f.options] })) ?? []);
    this.caseIndex.set(null);
    this.editing.set(null);
    this.editorDirty.set(false);
    this.error.set(null);
    this.conflict.set(false);
    this.saved.set(false);
  }
  async cancel(): Promise<void> {
    if (!this.dirty() || (await this.confirmDiscard()())) this.discard();
  }
  editCase(index = -1): void {
    if (this.saving()) return;
    this.caseIndex.set(index);
    this.caseName.reset(index < 0 ? "" : this.cases()[index].name);
    this.caseError.set(null);
    this.saved.set(false);
    setTimeout(() => document.getElementById("case-name")?.focus());
  }
  saveCase(): void {
    const name = this.caseName.value.trim(),
      index = this.caseIndex();
    if (this.caseName.invalid || index === null) {
      this.caseError.set("Укажите название кейса.");
      return;
    }
    if (
      name.includes("|") ||
      this.cases().some(
        (c, i) => i !== index && c.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
      )
    ) {
      this.caseError.set("Укажите уникальное название без символа |.");
      return;
    }
    this.cases.update(cases =>
      index < 0
        ? [...cases, { name, projectsCount: 0 }]
        : cases.map((c, i) => (i === index ? { ...c, name } : c)),
    );
    this.caseIndex.set(null);
  }
  deleteCase(index: number): void {
    if (!this.cases()[index].projectsCount && !this.saving())
      this.cases.update(cases => cases.filter((_, i) => i !== index));
  }
  editField(field: ManagementFormField | "new"): void {
    if (this.saving()) return;
    this.editor.controls.options.clear();
    const data =
      field === "new"
        ? { label: "", fieldType: "text" as const, helpText: "", isRequired: false, options: [] }
        : field;
    for (const option of data.options)
      this.editor.controls.options.push(this.fb.control(option, Validators.required));
    this.editor.reset({
      label: data.label,
      fieldType: data.fieldType,
      helpText: data.helpText,
      isRequired: data.isRequired,
      options: data.options,
    });
    this.editor.controls.fieldType.enable({ emitEvent: false });
    this.editor.controls.isRequired.enable({ emitEvent: false });
    this.editor.controls.options.enable({ emitEvent: false });
    if (field !== "new" && (field.answersCount > 0 || !field.editableType))
      this.editor.controls.fieldType.disable({ emitEvent: false });
    if (field !== "new" && !field.editableType) {
      this.editor.controls.isRequired.disable({ emitEvent: false });
      this.editor.controls.options.disable({ emitEvent: false });
    }
    this.editorDirty.set(false);
    this.editorError.set(null);
    this.editing.set(field);
    this.saved.set(false);
  }
  addOption(): void {
    this.editor.controls.options.push(this.fb.control("", Validators.required));
    this.editor.markAsDirty();
    this.editorDirty.set(true);
  }
  removeOption(index: number): void {
    this.editor.controls.options.removeAt(index);
    this.editor.markAsDirty();
    this.editorDirty.set(true);
  }
  get choiceEditor(): boolean {
    return ["select", "radio"].includes(this.editor.controls.fieldType.value);
  }
  async closeEditor(): Promise<void> {
    if (this.editorDirty() && !(await this.confirmDiscard()())) return;
    this.editing.set(null);
    this.editorDirty.set(false);
  }
  saveField(): void {
    const editing = this.editing();
    if (!editing) return;
    const data = this.editor.getRawValue();
    const options = this.choiceEditor
      ? data.options.map(o => o.trim())
      : editing !== "new" && !editing.editableType
        ? editing.options
        : [];
    if (!this.choiceEditor) this.editor.controls.options.clear();
    if (
      this.editor.invalid ||
      (this.choiceEditor &&
        (!options.length ||
          options.some(o => !o || o.includes("|")) ||
          new Set(options.map(o => o.toLocaleLowerCase())).size !== options.length))
    ) {
      this.editor.markAllAsTouched();
      this.editorError.set(
        "Заполните название и укажите неповторяющиеся варианты ответа без символа |.",
      );
      return;
    }
    const id = editing === "new" ? this.newId-- : editing.id;
    const field: ManagementFormField = {
      ...(editing === "new"
        ? { id, name: `local_${-id}`, answersCount: 0, editableType: true }
        : editing),
      ...data,
      label: data.label.trim(),
      helpText: data.helpText.trim(),
      options,
    };
    this.fields.update(fields =>
      editing === "new" ? [...fields, field] : fields.map(f => (f.id === field.id ? field : f)),
    );
    this.editing.set(null);
    this.editorDirty.set(false);
  }
  deleteField(field: ManagementFormField): void {
    if (!field.answersCount && !this.saving())
      this.fields.update(fields => fields.filter(f => f.id !== field.id));
  }
  save(): void {
    if (
      !this.snapshot() ||
      !this.dirty() ||
      this.saving() ||
      this.caseIndex() !== null ||
      this.editing()
    )
      return;
    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);
    this.api
      .saveProjectForm(this.programId(), this.writeBody())
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: data => {
          this.snapshot.set(data);
          this.discard();
          this.saved.set(true);
          this.savedAt.emit(data.updatedAt);
        },
        error: (error: HttpErrorResponse) => {
          this.conflict.set(error.status === 409);
          this.error.set(this.errorText(error));
        },
      });
  }
  openPreview(): void {
    const fields: PartnerProgramFields[] = [
      ...(this.cases().length
        ? [
            {
              id: -1,
              name: "case",
              label: "Кейс",
              fieldType: "select" as const,
              isRequired: true,
              helpText: "",
              options: this.cases().map(c => c.name),
            },
          ]
        : []),
      ...this.fields(),
    ];
    for (const name of Object.keys(this.previewForm.controls)) this.previewForm.removeControl(name);
    for (const field of fields) this.previewForm.addControl(field.name, programFieldControl(field));
    this.previewFields.set(fields);
    this.previewAttempt.set(0);
    this.previewMessage.set(null);
    this.previewOpen.set(true);
  }
  previewDraft(): void {
    this.previewAttempt.set(0);
    this.previewForm.markAsUntouched();
    this.previewInvalid.set(false);
    this.previewMessage.set(
      "Черновик сохранен в предпросмотре. Обязательные поля можно заполнить перед сдачей.",
    );
  }
  previewSubmit(): void {
    this.previewAttempt.update(n => n + 1);
    this.previewForm.markAllAsTouched();
    this.previewInvalid.set(this.previewForm.invalid);
    this.previewMessage.set(
      this.previewForm.invalid
        ? "Заполните отмеченные поля перед сдачей. Черновик и введенные значения сохранены в предпросмотре."
        : "Все поля заполнены. Форма готова к сдаче. Это предпросмотр — решение не отправлено.",
    );
  }
  private errorText(error: HttpErrorResponse): string {
    if (error.status === 403) return "У вас нет доступа к настройкам этой программы.";
    if (error.status === 401) return "Войдите в аккаунт, чтобы продолжить.";
    if (error.status === 409)
      return "Настройки уже изменены. Обновите данные и внесите изменения еще раз.";
    if (error.status === 400) {
      const detail = error.error?.fields ?? error.error?.cases ?? error.error?.detail;
      return (
        (typeof detail === "string"
          ? detail
          : Array.isArray(detail) && typeof detail[0] === "string"
            ? detail.join(" ")
            : "Проверьте название, тип и варианты ответа.") + " Изменения остались в форме."
      );
    }
    return "Не удалось загрузить или сохранить настройки. Проверьте соединение и повторите попытку.";
  }
}
