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
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import {
  ButtonDirective,
  FieldDirective,
  ChoiceDirective,
  AlertDirective,
  IconComponent,
} from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProgramRegistrationUseCase } from "@api/program/use-cases/program-registration.use-case";
import { ProgramRegistrationRepositoryPort } from "@domain/program/ports/program-registration.repository.port";
import { ProgramRegistrationHttpAdapter } from "@infrastructure/adapters/program/program-registration-http.adapter";
import {
  RegistrationField,
  RegistrationImport,
  RegistrationSchema,
  RegistrationSettings,
} from "@domain/program/program-registration.model";
import {
  registrationControls,
  RegistrationFieldsComponent,
} from "@ui/widgets/registration-fields/registration-fields.component";
import { evaluationError } from "@utils/evaluation-workspace";
@Component({
  selector: "app-management-registration",
  imports: [
    ReactiveFormsModule,
    ButtonDirective,
    FieldDirective,
    ChoiceDirective,
    AlertDirective,
    IconComponent,
    ModalComponent,
    RegistrationFieldsComponent,
  ],
  providers: [
    ProgramRegistrationUseCase,
    { provide: ProgramRegistrationRepositoryPort, useClass: ProgramRegistrationHttpAdapter },
  ],
  templateUrl: "./registration.component.html",
  styleUrl: "./registration.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementRegistrationComponent {
  readonly programId = input.required<number>();
  readonly confirmDiscard = input.required<() => Promise<boolean>>();
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  private readonly api = inject(ProgramRegistrationUseCase);
  private readonly destroy = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly snapshot = signal<RegistrationSettings | null>(null);
  readonly draft = signal<RegistrationSchema>({ mode: "native", fields: [] });
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly editorDirty = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly dirty = computed(
    () => JSON.stringify(this.draft()) !== JSON.stringify(this.snapshot()?.draft ?? this.draft()),
  );
  readonly unpublishedChanges = computed(
    () =>
      !!this.snapshot()?.published &&
      JSON.stringify(this.draft()) !== JSON.stringify(this.snapshot()?.published),
  );
  readonly dialog = signal<
    "field" | "preview" | "import" | "importPreview" | "connection" | "archive" | null
  >(null);
  readonly dialogError = signal<string | null>(null);
  readonly editing = signal<RegistrationField | null>(null);
  readonly importResult = signal<RegistrationImport | null>(null);
  readonly previewMobile = signal(false);
  previewGroup = registrationControls([]);
  private trigger: HTMLElement | null = null;
  readonly editor = this.fb.group({
    label: ["", [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    type: this.fb.control<RegistrationField["type"]>("text"),
    helpText: ["", Validators.maxLength(1000)],
    required: [false],
    source: this.fb.control<RegistrationField["source"]>("own"),
    options: [""],
    allowOther: [false],
    position: [1, Validators.min(1)],
  });
  readonly connection = this.fb.group({
    url: ["", [Validators.required, Validators.pattern(/^https?:\/\//)]],
    comment: ["", Validators.maxLength(2000)],
  });
  readonly fieldTypes = [
    { id: "text", label: "Короткий текст" },
    { id: "textarea", label: "Развёрнутый ответ" },
    { id: "number", label: "Число" },
    { id: "date", label: "Дата" },
    { id: "select", label: "Один вариант из списка" },
    { id: "multiselect", label: "Несколько вариантов" },
  ];
  readonly isList = () => ["select", "multiselect"].includes(this.editor.controls.type.value);
  constructor() {
    effect(() => {
      this.programId();
      untracked(() => this.reload());
    });
    this.editor.valueChanges
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(() => this.editorDirty.set(true));
    effect(() =>
      this.statusChange.emit({
        dirty: this.dirty() || (!!this.dialog() && this.editorDirty()),
        busy: this.busy(),
      }),
    );
  }
  reload() {
    if (this.busy()) return;
    this.loading.set(true);
    this.error.set(null);
    this.api
      .settings(this.programId())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: data => this.apply(data),
        error: e => this.error.set(evaluationError(e)),
      });
  }
  private apply(data: RegistrationSettings) {
    this.snapshot.set(data);
    this.draft.set(structuredClone(data.draft));
  }
  discard() {
    const data = this.snapshot();
    if (data) this.draft.set(structuredClone(data.draft));
    this.dialog.set(null);
    this.editor.markAsPristine();
    this.editorDirty.set(false);
  }
  setMode(mode: "native" | "external") {
    this.draft.update(d => ({ ...d, mode }));
    this.message.set(null);
  }
  typeLabel(field: RegistrationField) {
    return this.fieldTypes.find(t => t.id === field.type)?.label ?? field.type;
  }
  open(dialog: NonNullable<ReturnType<typeof this.dialog>>, event?: Event) {
    this.trigger = (event?.currentTarget as HTMLElement) ?? null;
    this.dialogError.set(null);
    this.dialog.set(dialog);
  }
  async close() {
    if (this.busy()) return;
    if (this.dialog() === "field" && this.editor.dirty && !(await this.confirmDiscard()())) return;
    this.dialog.set(null);
    this.editor.markAsPristine();
    this.editorDirty.set(false);
    queueMicrotask(() => this.trigger?.focus());
  }
  edit(field: RegistrationField | null, event?: Event) {
    this.editing.set(field);
    this.editor.reset({
      label: field?.label ?? "",
      type: field?.type ?? "text",
      helpText: field?.helpText ?? "",
      required: field?.required ?? false,
      source: field?.source ?? "own",
      options: field?.options.join("\n") ?? "",
      allowOther: field?.allowOther ?? false,
      position: field ? this.draft().fields.indexOf(field) + 1 : this.draft().fields.length + 1,
    });
    this.editorDirty.set(false);
    this.open("field", event);
  }
  saveField() {
    this.editor.markAllAsTouched();
    this.dialogError.set(null);
    if (this.editor.invalid) {
      this.dialogError.set("Укажите название поля и позицию в анкете.");
      return;
    }
    const value = this.editor.getRawValue();
    const list = this.isList();
    const field: RegistrationField = {
      id: this.editing()?.id ?? "f" + crypto.randomUUID().replace(/-/g, ""),
      label: value.label.trim(),
      type: value.type,
      helpText: value.helpText.trim(),
      required: value.required,
      source: list ? value.source : "own",
      options: list && value.source === "own" ? this.parseOptions(value.options).options : [],
      allowOther: list && value.allowOther,
    };
    const fields = this.draft().fields.filter(f => f.id !== field.id);
    fields.splice(Math.max(0, Math.min(fields.length, value.position - 1)), 0, field);
    this.draft.update(d => ({ ...d, fields }));
    this.dialog.set(null);
    this.editor.markAsPristine();
    this.editorDirty.set(false);
    queueMicrotask(() => this.trigger?.focus());
  }
  remove(field: RegistrationField, event?: Event) {
    this.editing.set(field);
    if (this.snapshot()?.answeredFieldIds.includes(field.id)) this.open("archive", event);
    else this.removeNow();
  }
  removeNow() {
    const field = this.editing();
    this.draft.update(d => ({ ...d, fields: d.fields.filter(f => f.id !== field?.id) }));
    this.dialog.set(null);
    this.message.set("Поле убрано из черновика. Примените изменения публикацией формы.");
  }
  save(publish = false) {
    const snapshot = this.snapshot();
    if (!snapshot || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.message.set(null);
    this.api
      .save(this.programId(), snapshot.revision, this.draft(), publish)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: data => {
          this.apply(data);
          this.message.set(
            publish
              ? "Форма опубликована. Ссылку можно отправлять участникам."
              : "Черновик сохранён.",
          );
        },
        error: e => this.error.set(evaluationError(e)),
      });
  }
  preview(event?: Event) {
    this.previewGroup = registrationControls(this.draft().fields);
    this.previewGroup.disable();
    this.open("preview", event);
  }
  async copy() {
    try {
      await navigator.clipboard.writeText(this.snapshot()?.link ?? "");
      this.message.set("Ссылка скопирована.");
    } catch {
      this.error.set("Не удалось скопировать. Выделите ссылку и скопируйте вручную.");
    }
  }
  private parseOptions(text: string): RegistrationImport {
    const seen = new Set<string>();
    let duplicates = 0,
      blanks = 0;
    const options: string[] = [];
    for (const row of text.split(/\r?\n/)) {
      const value = row.trim();
      if (!value) blanks++;
      else if (seen.has(value.toLocaleLowerCase())) duplicates++;
      else {
        seen.add(value.toLocaleLowerCase());
        options.push(value);
      }
    }
    return { options, duplicates, blanks };
  }
  pastePreview() {
    const result = this.parseOptions(this.editor.controls.options.value);
    if (
      !result.options.length ||
      result.options.length > 5000 ||
      result.options.some(v => v.length > 500)
    ) {
      this.dialogError.set(
        "Укажите от 1 до 5000 вариантов, по одному на строке, до 500 символов каждый.",
      );
      return;
    }
    this.importResult.set(result);
    this.open("importPreview");
  }
  upload(event: Event) {
    const input = event.target as HTMLInputElement,
      file = input.files?.[0];
    if (!file) return;
    input.value = "";
    this.busy.set(true);
    this.dialogError.set(null);
    this.api
      .importOptions(this.programId(), file)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          this.importResult.set(result);
          this.dialog.set("importPreview");
        },
        error: e => this.dialogError.set(evaluationError(e)),
      });
  }
  applyImport() {
    this.editor.controls.options.setValue(this.importResult()?.options.join("\n") ?? "");
    this.editor.markAsDirty();
    this.dialog.set("field");
  }
  requestConnection() {
    this.connection.markAllAsTouched();
    if (this.connection.invalid || this.busy()) return;
    this.busy.set(true);
    this.dialogError.set(null);
    const value = this.connection.getRawValue();
    this.api
      .connect(this.programId(), value.url, value.comment)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: data => {
          this.snapshot.set(data);
          this.dialog.set(null);
          this.message.set("Запрос сохранён. Подключение формы выполнит администратор платформы.");
        },
        error: e => this.dialogError.set(evaluationError(e)),
      });
  }
}
