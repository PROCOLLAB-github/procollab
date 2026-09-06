/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { defer, map, Observable, of, Subject, Subscription, switchMap, takeUntil, tap } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import {
  ProgramLinkField,
  ProgramLinkFields,
  ProgramLinkFieldsError,
} from "@domain/project/program-link-fields.model";
import { PROGRAM_CASE_FIELD_NAME } from "@domain/program/program-case-field.const";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";
import { AsyncState, failure, initial, loading, success } from "@domain/shared/async-state";
import { fail, ok, Result } from "@domain/shared/result.type";
import { GetProgramLinkFieldsUseCase } from "../../use-cases/get-program-link-fields.use-case";
import { UpdateProgramLinkFieldsUseCase } from "../../use-cases/update-program-link-fields.use-case";
import { SubmitCompetitiveProjectUseCase } from "../../use-cases/submit-competitive-project.use-case";
import {
  mapProgramLinkFieldsError,
  programLinkFieldsErrorMessage,
} from "../../program-link-fields-error";

/** Parse positive integer IDs only, never a project/program ID in place of a relation. */
function linkId(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

/** Owns the canonical relation context, stable form and cancellable fields lifecycle. */
@Injectable()
export class ProjectAdditionalService {
  private readonly fb = inject(FormBuilder);
  private readonly getFields = inject(GetProgramLinkFieldsUseCase);
  private readonly updateFields = inject(UpdateProgramLinkFieldsUseCase);
  private readonly submitProject = inject(SubmitCompetitiveProjectUseCase);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly additionalForm = this.fb.group({}) as FormGroup;
  private readonly contextChanges = new Subject<void>();
  private readonly formChanges = new Subject<void>();
  private loadSubscription?: Subscription;
  private context: { projectId: number; programLinkId: number } | null = null;
  private contextKey = "";

  readonly partnerProgramFields = signal<ProgramLinkField[]>([]);
  readonly fieldsState = signal<AsyncState<ProgramLinkFields>>(initial());
  readonly hasProgramLink = signal(false);
  /** Exposed only after GET verifies both the relation and the route project. */
  readonly activeProgramLinkId = signal<number | null>(null);
  readonly submitted = signal(false);
  readonly pending = computed(() => this.fieldsState().status === "loading");
  readonly loadFailed = computed(() => this.fieldsState().status === "failure");
  readonly saveError = signal<string | null>(null);
  readonly caseError = signal<string | null>(null);
  readonly isSend$ = signal<AsyncState<void>>(initial());
  readonly errorAssignProjectToProgramModalMessage = signal<{ non_field_errors: string[] } | null>(
    null,
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.loadSubscription?.unsubscribe();
      this.contextChanges.next();
      this.contextChanges.complete();
      this.formChanges.next();
      this.formChanges.complete();
    });
  }

  getAdditionalForm(): FormGroup {
    return this.additionalForm;
  }

  /** Query ID wins over the legacy single-link fallback. Changes cancel old work immediately. */
  setContext(projectId: number | null, routeLink: unknown, fallbackLink?: number): void {
    const activeLink = linkId(routeLink) ?? linkId(fallbackLink);
    const key = JSON.stringify([projectId, activeLink, activeLink === null ? routeLink : null]);
    if (key === this.contextKey) return;
    this.contextKey = key;
    this.loadSubscription?.unsubscribe();
    this.contextChanges.next();
    this.context = projectId && activeLink ? { projectId, programLinkId: activeLink } : null;
    this.activeProgramLinkId.set(null);
    this.hasProgramLink.set(activeLink !== null || !!routeLink);
    this.submitted.set(false);
    this.partnerProgramFields.set([]);
    this.clearForm();
    this.saveError.set(null);
    this.caseError.set(null);
    this.isSend$.set(initial());
    this.fieldsState.set(initial());
    if (this.context) this.loadFields();
    else if (projectId && routeLink) this.fieldsState.set(failure("invalid_link"));
    else if (!projectId && this.hasProgramLink()) this.fieldsState.set(loading());
  }

  retry(): void {
    if (this.context) this.loadFields(this.partnerProgramFields().length > 0);
  }

  private clearForm(): void {
    this.formChanges.next();
    for (const name of Object.keys(this.additionalForm.controls)) {
      this.additionalForm.removeControl(name, { emitEvent: false });
    }
    this.additionalForm.enable({ emitEvent: false });
  }

  private loadFields(preserveEdits = false): void {
    const context = this.context;
    if (!context) return;
    this.loadSubscription?.unsubscribe();
    this.activeProgramLinkId.set(null);
    this.fieldsState.set(loading());
    const editedValues = preserveEdits ? this.additionalForm.getRawValue() : null;
    this.loadSubscription = this.getFields
      .execute(context.programLinkId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (this.context !== context) return;
        if (!result.ok) {
          this.logger.error("Cannot load program-link fields", result.error.cause);
          this.fieldsState.set(failure("load_error"));
          return;
        }
        const snapshot = result.value;
        if (
          snapshot.projectId !== context.projectId ||
          snapshot.programLinkId !== context.programLinkId
        ) {
          this.logger.error("Program-link fields context mismatch", {
            expected: context,
            receivedProjectId: snapshot.projectId,
            receivedLinkId: snapshot.programLinkId,
          });
          this.fieldsState.set(failure("context_mismatch"));
          this.partnerProgramFields.set([]);
          this.clearForm();
          return;
        }
        this.initializeAdditionalForm(snapshot, snapshot.submitted ? null : editedValues);
        this.activeProgramLinkId.set(context.programLinkId);
        this.fieldsState.set(success(snapshot));
      });
  }

  private initializeAdditionalForm(
    snapshot: ProgramLinkFields,
    edits: Record<string, unknown> | null,
  ): void {
    this.clearForm();
    this.partnerProgramFields.set(snapshot.fields);
    this.submitted.set(snapshot.submitted);
    for (const field of snapshot.fields) {
      const isCase = field.name === PROGRAM_CASE_FIELD_NAME;
      let value = edits && field.name in edits ? edits[field.name] : field.value;
      if (field.fieldType === "checkbox" || field.fieldType === "radio") {
        value =
          value === true || (typeof value === "string" && value.trim().toLowerCase() === "true");
      } else value ??= "";
      if (isCase && !snapshot.submitted && value !== "" && !field.options.includes(String(value))) {
        value = "";
        this.caseError.set("Выбранный кейс больше недоступен. Выберите актуальный кейс.");
      }
      const validators = field.isRequired || isCase ? [Validators.required] : [];
      if (isCase)
        validators.push(control => {
          if (typeof control.value !== "string" || !control.value.trim()) return { required: true };
          return field.options.includes(control.value) ? null : { caseUnavailable: true };
        });
      if (field.fieldType === "text") validators.push(Validators.maxLength(500));
      if (field.fieldType === "textarea") validators.push(Validators.maxLength(300));
      const control = new FormControl(value, validators);
      this.additionalForm.addControl(field.name, control, { emitEvent: false });
      if (isCase)
        control.valueChanges
          .pipe(takeUntil(this.formChanges), takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.caseError.set(null);
            this.saveError.set(null);
          });
    }
    if (snapshot.submitted) this.additionalForm.disable({ emitEvent: false });
    this.additionalForm.updateValueAndValidity({ emitEvent: false });
  }

  toggleAdditionalFormValues(fieldType: string, fieldName: string): void {
    if (this.submitted()) return;
    if (fieldType === "checkbox" || fieldType === "radio") {
      const control = this.additionalForm.get(fieldName);
      control?.setValue(!control.value);
    }
  }

  setBooleanValue(fieldName: string, value: boolean): void {
    if (!this.submitted()) this.additionalForm.get(fieldName)?.setValue(value);
  }

  validateRequiredFields(): boolean {
    this.additionalForm.markAllAsTouched();
    this.additionalForm.updateValueAndValidity();
    return this.additionalForm.invalid;
  }

  /** Empty case is omitted from partial draft PUT; generic serialization stays unchanged. */
  private valuesForSave(): ProjectNewAdditionalProgramFields[] {
    return this.partnerProgramFields().flatMap(field => {
      const value = this.additionalForm.get(field.name)?.value;
      if (field.name === PROGRAM_CASE_FIELD_NAME && (value == null || String(value).trim() === ""))
        return [];
      return [ProjectNewAdditionalProgramFields.fromField(field, String(value))];
    });
  }

  /** PUT and optional submit use the same verified link, cancelled on route context changes. */
  save(programLinkId: number, submit: boolean): Observable<Result<void, ProgramLinkFieldsError>> {
    return defer(() => {
      if (
        this.activeProgramLinkId() !== programLinkId ||
        this.fieldsState().status !== "success" ||
        this.submitted() ||
        this.isSend$().status === "loading"
      ) {
        return of(fail<ProgramLinkFieldsError>({ kind: "context" }));
      }
      if (submit && this.validateRequiredFields()) {
        return of(
          fail<ProgramLinkFieldsError>({
            kind: this.additionalForm.get(PROGRAM_CASE_FIELD_NAME)?.invalid
              ? "case_required"
              : "unknown",
          }),
        );
      }
      this.saveError.set(null);
      this.caseError.set(null);
      this.isSend$.set(loading());
      return this.updateFields.execute(programLinkId, this.valuesForSave()).pipe(
        switchMap(result => {
          if (!result.ok || !submit) return of(result);
          return this.submitProject
            .execute(programLinkId)
            .pipe(
              map(submission =>
                submission.ok
                  ? ok(undefined)
                  : fail(mapProgramLinkFieldsError(submission.error.cause)),
              ),
            );
        }),
        tap(result => {
          if (!result.ok) {
            this.logger.error("Cannot save/submit program-link fields", result.error.cause);
            this.isSend$.set(failure(result.error.kind));
            const message = programLinkFieldsErrorMessage(result.error);
            this.saveError.set(message);
            if (result.error.kind === "case_required" || result.error.kind === "case_unavailable") {
              this.caseError.set(message);
              const control = this.additionalForm.get(PROGRAM_CASE_FIELD_NAME);
              control?.setErrors({ ...(control.errors ?? {}), caseBackend: true });
              control?.markAsTouched();
              if (result.error.kind === "case_unavailable") this.loadFields(true);
            }
          } else {
            this.isSend$.set(success(undefined));
            if (submit) {
              this.submitted.set(true);
              this.additionalForm.disable({ emitEvent: false });
            }
          }
        }),
        takeUntil(this.contextChanges),
        takeUntilDestroyed(this.destroyRef),
      );
    });
  }

  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.errorAssignProjectToProgramModalMessage.set(error);
    this.isSend$.set(failure("assign_error"));
  }

  clearAssignProjectToProgramError(): void {
    this.errorAssignProjectToProgramModalMessage.set(null);
    this.isSend$.set(initial());
  }
}
