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
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, Subject, takeUntil } from "rxjs";
import {
  AlertDirective,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
  IconComponent,
} from "@uilib";
import {
  GetManagedSolutionFormUseCase,
  GetSolutionTemplatesUseCase,
  SaveManagedSolutionFormUseCase,
} from "@api/solution/use-cases/solution-form.use-cases";
import {
  SolutionField,
  SolutionFieldType,
  SolutionFormManagement,
  SolutionFormWrite,
  SolutionPurpose,
  SolutionTemplate,
  SolutionTemplateName,
} from "@domain/solution/solution-contract.model";
import {
  EditableSolutionField,
  fieldWrite,
  rebaseSolutionFields,
} from "@domain/solution/solution-form-rebase";
import { solutionFieldsGroup } from "@utils/solution-field-controls";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { SolutionFieldsComponent } from "@ui/widgets/solution-fields/solution-fields.component";

const emptyValidation = () => ({
  minLength: null as number | null,
  maxLength: null as number | null,
  minimum: null as number | null,
  maximum: null as number | null,
  allowedExtensions: [] as string[],
  maxFileSizeBytes: null as number | null,
});
const integerConstraint: ValidatorFn = control =>
  control.value === null || Number.isInteger(control.value) ? null : { integer: true };
const purposeTypes: Partial<Record<SolutionPurpose, SolutionFieldType>> = {
  case: "select",
  presentation: "file",
  repository: "url",
  demo: "url",
  video: "url",
  run_instructions: "textarea",
};

@Component({
  selector: "app-management-solution-form",
  imports: [
    ReactiveFormsModule,
    AlertDirective,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    IconComponent,
    ModalComponent,
    SolutionFieldsComponent,
  ],
  templateUrl: "./solution-form.component.html",
  styleUrl: "./solution-form.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementSolutionFormComponent {
  readonly programId = input.required<number>();
  readonly confirmDiscard = input.required<() => Promise<boolean>>();
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  private readonly getForm = inject(GetManagedSolutionFormUseCase);
  private readonly saveForm = inject(SaveManagedSolutionFormUseCase);
  private readonly getTemplates = inject(GetSolutionTemplatesUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelRead = new Subject<void>();
  private readonly cancelSave = new Subject<void>();
  private context = 0;
  private clientKey = -1;
  readonly snapshot = signal<SolutionFormManagement | null>(null);
  readonly fields = signal<EditableSolutionField[]>([]);
  readonly template = signal<SolutionTemplateName | null>(null);
  readonly templates = signal<SolutionTemplate[]>([]);
  readonly templateError = signal("");
  readonly templateLoading = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal("");
  readonly notice = signal("");
  readonly missingIds = signal<number[]>([]);
  readonly editing = signal<number | null>(null);
  readonly editorDirty = signal(false);
  readonly editorError = signal("");
  readonly previewOpen = signal(false);
  readonly previewFields = signal<SolutionField[]>([]);
  readonly previewGroup = signal(solutionFieldsGroup([]));
  readonly templateChoice = new FormControl<SolutionTemplateName | null>(null);
  readonly typeLabels: Record<SolutionFieldType, string> = {
    text: "Короткий текст",
    textarea: "Многострочный текст",
    url: "Ссылка",
    number: "Число",
    select: "Выбор из списка",
    checkbox: "Да или нет",
    file: "Файл",
    radio: "Радио (существующее поле)",
  };
  readonly purposeLabels: Record<SolutionPurpose, string> = {
    other: "Дополнительное поле",
    case: "Кейс или задача",
    presentation: "Презентация",
    repository: "Репозиторий",
    demo: "Демо",
    video: "Видео",
    run_instructions: "Инструкция запуска",
  };
  readonly types: SolutionFieldType[] = [
    "text",
    "textarea",
    "url",
    "number",
    "select",
    "checkbox",
    "file",
  ];
  readonly purposes = Object.keys(this.purposeLabels) as SolutionPurpose[];
  readonly editor = new FormGroup({
    label: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(256)],
    }),
    type: new FormControl<SolutionFieldType>("text", { nonNullable: true }),
    purpose: new FormControl<SolutionPurpose>("other", { nonNullable: true }),
    helpText: new FormControl("", { nonNullable: true, validators: Validators.maxLength(4000) }),
    required: new FormControl(false, { nonNullable: true }),
    options: new FormArray<FormControl<string>>([]),
    minLength: new FormControl<number | null>(null, [Validators.min(0), integerConstraint]),
    maxLength: new FormControl<number | null>(null, [Validators.min(0), integerConstraint]),
    minimum: new FormControl<number | null>(null),
    maximum: new FormControl<number | null>(null),
    extensions: new FormControl("", { nonNullable: true }),
    maxFileSizeMiB: new FormControl<number | null>(null, [
      Validators.min(1 / 1048576),
      Validators.max(100),
    ]),
  });
  readonly dirty = computed(() => {
    const original = this.snapshot();
    return (
      !!original &&
      (JSON.stringify(this.writeBody()) !==
        JSON.stringify({
          expectedRevision: original.form.revision,
          template: original.form.template,
          fields: original.form.fields.map((field, index) => fieldWrite(field, index)),
        }) ||
        this.editorDirty())
    );
  });
  constructor() {
    effect(() => {
      const id = this.programId();
      untracked(() => {
        if (id !== this.context) {
          this.cancelSave.next();
          this.snapshot.set(null);
          this.fields.set([]);
          this.editing.set(null);
          this.editorDirty.set(false);
          this.context = id;
        }
        this.load(false);
      });
    });
    effect(() =>
      this.statusChange.emit({ dirty: this.dirty(), busy: this.loading() || this.saving() }),
    );
    this.loadTemplates();
    this.editor.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.editorDirty.set(this.editor.dirty));
    this.editor.controls.purpose.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(purpose => this.configurePurpose(purpose));
  }
  loadTemplates() {
    if (this.templateLoading()) return;
    this.templateLoading.set(true);
    this.templateError.set("");
    this.getTemplates
      .execute()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.templateLoading.set(false)),
      )
      .subscribe(result => {
        if (result.ok) this.templates.set(result.value.results);
        else this.templateError.set(result.error.detail);
      });
  }
  private writeBody(): SolutionFormWrite {
    return {
      expectedRevision: this.snapshot()?.form.revision ?? "",
      template: this.template() ?? "case_championship",
      fields: this.fields().map((field, index) => fieldWrite(field, index)),
    };
  }
  private load(keepLocal: boolean) {
    this.cancelRead.next();
    this.loading.set(true);
    const id = this.programId();
    this.getForm
      .execute(id)
      .pipe(
        takeUntil(this.cancelRead),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(result => {
        if (id !== this.context) return;
        if (!result.ok) {
          if (
            ["forbidden", "permission_denied", "not_found", "authentication_required"].includes(
              result.error.code,
            )
          ) {
            this.snapshot.set(null);
            this.fields.set([]);
            this.editing.set(null);
            this.editorDirty.set(false);
          }
          this.error.set(result.error.detail);
          return;
        }
        const before = this.snapshot();
        if (keepLocal && before) {
          const rebased = rebaseSolutionFields(
            before.form.fields,
            this.fields(),
            result.value.form.fields,
          );
          this.fields.set(rebased.fields);
          this.missingIds.set(rebased.missing);
          if (this.template() === before.form.template)
            this.template.set(result.value.form.template);
          this.snapshot.set(result.value);
          this.notice.set(
            "Форма обновлена. Ваши правки сохранены локально. Проверьте их и сохраните еще раз.",
          );
        } else {
          this.snapshot.set(result.value);
          this.discard();
        }
        if (result.value.hasAnswers) this.templateChoice.disable({ emitEvent: false });
        else this.templateChoice.enable({ emitEvent: false });
      });
  }
  reload() {
    if (this.saving()) return;
    if (!this.snapshot()) this.load(false);
    else this.load(true);
  }
  discard() {
    const snapshot = this.snapshot();
    this.fields.set(
      snapshot?.form.fields.map(field => ({ ...structuredClone(field), clientKey: field.id })) ??
        [],
    );
    this.template.set(snapshot?.form.template ?? null);
    this.templateChoice.setValue(this.template(), { emitEvent: false });
    this.editing.set(null);
    this.editorDirty.set(false);
    this.error.set("");
    this.notice.set("");
    this.missingIds.set([]);
  }
  async cancel() {
    const context = this.context;
    if ((!this.dirty() || (await this.confirmDiscard()())) && context === this.context)
      this.discard();
  }
  async applyTemplate() {
    const key = this.templateChoice.value,
      template = this.templates().find(template => template.key === key);
    const context = this.context;
    if (!template || this.saving() || this.loading() || this.snapshot()?.hasAnswers) return;
    if (this.dirty() && !(await this.confirmDiscard()())) return;
    if (context !== this.context) return;
    this.template.set(template.key);
    this.fields.set(
      template.fields.map(field => ({ ...structuredClone(field), clientKey: this.clientKey-- })),
    );
    this.editing.set(null);
    this.editorDirty.set(false);
    this.missingIds.set([]);
    this.error.set("");
    this.notice.set("");
  }
  usage(field: EditableSolutionField) {
    return this.snapshot()?.fieldsUsage.find(usage => usage.fieldId === field.id);
  }
  canDelete(field: EditableSolutionField) {
    return (
      this.missingIds().includes(field.id ?? 0) ||
      (field.purpose !== "case" && (field.id === null || this.usage(field)?.canDelete === true))
    );
  }
  remove(field: EditableSolutionField) {
    if (this.saving() || !this.canDelete(field)) return;
    this.fields.update(fields => fields.filter(row => row.clientKey !== field.clientKey));
    this.missingIds.update(ids => ids.filter(id => id !== field.id));
  }
  move(index: number, offset: number) {
    if (this.saving()) return;
    const fields = [...this.fields()],
      target = index + offset;
    if (target < 0 || target >= fields.length) return;
    [fields[index], fields[target]] = [fields[target], fields[index]];
    this.fields.set(fields);
  }
  edit(field?: EditableSolutionField) {
    if (this.saving()) return;
    this.editing.set(field?.clientKey ?? this.clientKey--);
    this.editorError.set("");
    this.editor.enable({ emitEvent: false });
    this.editor.controls.options.clear({ emitEvent: false });
    for (const option of field?.options ?? [])
      this.editor.controls.options.push(
        new FormControl(option, {
          nonNullable: true,
          validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(1000)],
        }),
        { emitEvent: false },
      );
    const validation = field?.validation ?? emptyValidation();
    this.editor.reset(
      {
        label: field?.label ?? "",
        type: field?.type ?? "text",
        purpose: field?.purpose ?? "other",
        helpText: field?.helpText ?? "",
        required: field?.required ?? false,
        minLength: validation.minLength,
        maxLength: validation.maxLength,
        minimum: validation.minimum,
        maximum: validation.maximum,
        extensions: validation.allowedExtensions.join(", "),
        maxFileSizeMiB:
          validation.maxFileSizeBytes === null ? null : validation.maxFileSizeBytes / 1048576,
      },
      { emitEvent: false },
    );
    if (field && field.id !== null && this.usage(field)?.canChangeType === false) {
      this.editor.controls.type.disable({ emitEvent: false });
      this.editor.controls.purpose.disable({ emitEvent: false });
    }
    this.configurePurpose(field?.purpose ?? "other");
    this.editor.markAsPristine();
    this.editorDirty.set(false);
  }
  private configurePurpose(purpose: SolutionPurpose) {
    const type = purposeTypes[purpose];
    const source = this.fields().find(field => field.clientKey === this.editing());
    const used = source && source.id !== null && this.usage(source)?.canChangeType === false;
    if (type) {
      this.editor.controls.type.setValue(type, { emitEvent: false });
      this.editor.controls.type.disable({ emitEvent: false });
    } else if (!used) this.editor.controls.type.enable({ emitEvent: false });
    if (purpose === "case") {
      this.editor.controls.required.setValue(true, { emitEvent: false });
      this.editor.controls.required.disable({ emitEvent: false });
    } else this.editor.controls.required.enable({ emitEvent: false });
  }
  addOption() {
    this.editor.controls.options.push(
      new FormControl("", {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(1000)],
      }),
    );
    this.editor.markAsDirty();
    this.editorDirty.set(true);
  }
  removeOption(index: number) {
    this.editor.controls.options.removeAt(index);
    this.editor.markAsDirty();
    this.editorDirty.set(true);
  }
  applyField() {
    this.editor.markAllAsTouched();
    if (this.editor.invalid) return;
    const value = this.editor.getRawValue(),
      choice = ["select", "radio"].includes(value.type);
    if (
      choice &&
      (!value.options.length ||
        new Set(value.options.map(option => option.trim().toLocaleLowerCase())).size !==
          value.options.length)
    ) {
      this.editorError.set("Добавьте неповторяющиеся варианты выбора.");
      return;
    }
    const source = this.fields().find(field => field.clientKey === this.editing());
    const validation = emptyValidation();
    if (["text", "textarea", "url"].includes(value.type))
      Object.assign(validation, { minLength: value.minLength, maxLength: value.maxLength });
    if (value.type === "number")
      Object.assign(validation, { minimum: value.minimum, maximum: value.maximum });
    if (value.type === "file")
      Object.assign(validation, {
        allowedExtensions: value.extensions
          .split(",")
          .map(extension => extension.trim().toLowerCase())
          .filter(Boolean),
        maxFileSizeBytes:
          value.maxFileSizeMiB === null ? null : Math.round(value.maxFileSizeMiB * 1048576),
      });
    if (
      (validation.minLength !== null &&
        validation.maxLength !== null &&
        validation.minLength > validation.maxLength) ||
      (validation.minimum !== null &&
        validation.maximum !== null &&
        validation.minimum > validation.maximum)
    ) {
      this.editorError.set("Минимум не должен превышать максимум.");
      return;
    }
    const field: EditableSolutionField = {
      id: source?.id ?? null,
      clientKey: this.editing()!,
      label: value.label,
      type: value.type,
      purpose: value.purpose,
      helpText: value.helpText,
      required: value.required,
      position: source?.position ?? this.fields().length,
      options: choice ? value.options : [],
      validation,
    };
    this.fields.update(fields =>
      source
        ? fields.map(row => (row.clientKey === source.clientKey ? field : row))
        : [...fields, field],
    );
    this.editing.set(null);
    this.editorDirty.set(false);
  }
  async closeEditor() {
    const context = this.context;
    if (!this.editorDirty() || (await this.confirmDiscard()())) {
      if (context !== this.context) return;
      this.editing.set(null);
      this.editorDirty.set(false);
    }
  }
  openPreview() {
    const fields = this.fields().map((field, index) => ({
      ...fieldWrite(field, index),
      id: field.id ?? field.clientKey,
    }));
    this.previewFields.set(fields);
    this.previewGroup.set(solutionFieldsGroup(fields));
    this.previewOpen.set(true);
  }
  save() {
    if (
      this.saving() ||
      this.loading() ||
      !this.snapshot() ||
      !this.template() ||
      this.editing() !== null ||
      this.missingIds().length
    )
      return;
    this.saving.set(true);
    this.error.set("");
    this.notice.set("");
    const id = this.context;
    this.saveForm
      .execute(id, this.writeBody())
      .pipe(
        takeUntil(this.cancelSave),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe(result => {
        if (id !== this.context) return;
        if (result.ok) {
          this.snapshot.set(result.value);
          this.discard();
          this.notice.set("Форма решения сохранена.");
        } else {
          this.error.set(result.error.detail);
          if (result.error.code === "form_revision_conflict") this.load(true);
        }
      });
  }
}
