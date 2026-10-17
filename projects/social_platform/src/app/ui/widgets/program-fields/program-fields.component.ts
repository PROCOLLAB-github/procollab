/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { FileService } from "@corelib";
import { AlertDirective, ButtonDirective, ChoiceDirective, FieldDirective } from "@uilib";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-program-fields",
  templateUrl: "./program-fields.component.html",
  styleUrl: "./program-fields.component.scss",
  imports: [ReactiveFormsModule, AlertDirective, ButtonDirective, ChoiceDirective, FieldDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramFieldsComponent {
  readonly fields = input.required<PartnerProgramFields[]>();
  readonly form = input.required<FormGroup>();
  readonly preview = input(false);
  readonly submissionAttempt = input(0);
  readonly caseError = input<string | null>(null);
  // A callback also clears the owner's guard when an in-flight upload is cancelled
  // by destroying this step; Angular outputs are already closed during teardown.
  readonly setUploadBusy = input<(busy: boolean) => void>(() => {});
  readonly uploading = signal<string | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly fileNames = signal<Record<string, string>>({});
  readonly href = presentationHref;
  private readonly files = inject(FileService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    effect(() => {
      const attempt = this.submissionAttempt();
      if (attempt)
        setTimeout(() =>
          this.element.nativeElement.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(),
        );
    });
    this.destroyRef.onDestroy(() => this.setUploadBusy()(false));
  }
  error(field: PartnerProgramFields): string | null {
    const c = this.form().get(field.name);
    if (field.name === "case" && this.caseError()) return this.caseError();
    if (!c?.invalid || (!this.submissionAttempt() && !c.touched)) return null;
    if (c.hasError("required"))
      return this.submissionAttempt()
        ? field.name === "case"
          ? "Выберите кейс."
          : "Заполните поле перед сдачей решения."
        : null;
    if (c.hasError("maxlength")) return "Текст слишком длинный.";
    return "Выбранный вариант больше недоступен. Выберите другой.";
  }
  chooseFile(event: Event, field: PartnerProgramFields): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    const control = this.form().get(field.name);
    if (!file || !control || control.disabled || this.uploading()) return;
    this.uploadError.set(null);
    if (this.preview()) {
      this.fileNames.update(names => ({ ...names, [field.name]: file.name }));
      control.setValue("preview-file");
      control.markAsDirty();
      return;
    }
    this.uploading.set(field.name);
    this.setUploadBusy()(true);
    this.files
      .uploadFile(file)
      .pipe(
        finalize(() => {
          this.uploading.set(null);
          this.setUploadBusy()(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          if (!this.href(result.url)) {
            this.uploadError.set("Сервер не вернул ссылку на файл. Повторите загрузку.");
            return;
          }
          this.fileNames.update(names => ({ ...names, [field.name]: file.name }));
          control.setValue(result.url);
          control.markAsDirty();
        },
        error: () => this.uploadError.set("Не удалось загрузить файл. Выберите его ещё раз."),
      });
  }
  clearFile(field: PartnerProgramFields): void {
    const c = this.form().get(field.name);
    if (!c || c.disabled || this.uploading()) return;
    c.setValue("");
    c.markAsDirty();
    this.fileNames.update(names => ({ ...names, [field.name]: "" }));
  }
}
