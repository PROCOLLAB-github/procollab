/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  ElementRef,
  inject,
  input,
  Input,
  OnDestroy,
  signal,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validator,
  ValidationErrors,
  AbstractControl,
} from "@angular/forms";
import { noop, Subscription } from "rxjs";
import { RangeCriterionInputComponent } from "./components/range-criterion-input/range-criterion-input.component";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import {
  evaluationCriterionControl,
  EvaluationCriterion,
} from "@utils/evaluation-criterion-control";
import { ButtonDirective, FieldDirective } from "@uilib";

/** Оценка проекта по числовым, булевым и текстовым критериям через ControlValueAccessor. */
@Component({
  selector: "app-project-rating",
  imports: [
    CommonModule,
    RangeCriterionInputComponent,
    ReactiveFormsModule,
    FieldDirective,
    ButtonDirective,
  ],
  templateUrl: "./project-rating.component.html",
  styleUrl: "./project-rating.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProjectRatingComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ProjectRatingComponent),
      multi: true,
    },
  ],
})
export class ProjectRatingComponent implements OnDestroy, ControlValueAccessor, Validator {
  @Input({ required: true })
  set criteria(val: EvaluationCriterion[]) {
    if (!val) return;
    const ordered = [...val.filter(c => c.type !== "str"), ...val.filter(c => c.type === "str")];
    this._criteria.set(ordered);
    this.createFormControls(ordered);
    this.trackFormValueChange();
    queueMicrotask(() => {
      this.onChange(this.form.getRawValue());
      this.validatorChanged();
    });
  }

  get criteria(): EvaluationCriterion[] {
    return this._criteria();
  }

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    if (this.form) {
      this.disabled
        ? this.form.disable({ emitEvent: false })
        : this.form.enable({ emitEvent: false });
    }
  }

  get disabled(): boolean {
    return this._disabled || this.controlDisabled;
  }

  private _disabled = false;
  private controlDisabled = false;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  chooseBoolean(id: number, value: boolean): void {
    const control = this.form.get(String(id));
    control?.markAsDirty();
    control?.markAsTouched();
    control?.setValue(value);
  }

  validateAndFocus(): boolean {
    this.form.markAllAsTouched();
    if (this.form.valid) return true;
    const invalid = this.criteria.find(c => this.form.get(String(c.id))?.invalid);
    queueMicrotask(() => {
      const section = this.element.nativeElement.querySelector(`[data-criterion="${invalid?.id}"]`);
      const target = section?.querySelector<HTMLElement>("input, textarea, button");
      target?.focus();
      target?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    });
    return false;
  }

  readonly currentUserId = input<number>();
  readonly layout = input<"compact" | "full">("compact");

  /** Сигнал для хранения критериев оценки */
  _criteria = signal<EvaluationCriterion[]>([]);

  /** Форма для управления всеми критериями оценки */
  form!: FormGroup;
  private pendingValue: Record<string, unknown> | null = null;
  private validatorChanged: () => void = noop;

  errorMessage = ErrorMessage;

  /** Сигнал для хранения подписок */
  subscriptions$ = signal<Subscription[]>([]);

  onChange: (val: unknown) => void = noop;
  onTouched: () => void = noop;

  writeValue(val: typeof this.form.value): void {
    this.pendingValue = val ?? null;
    if (this.form && val) this.form.patchValue(val, { emitEvent: false });
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
    queueMicrotask(() => {
      if (this.form) this.onChange(this.form.getRawValue());
    });
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(_: AbstractControl): ValidationErrors | null {
    let output: ValidationErrors | null = null;

    if (this.form?.invalid) {
      // Проверка каждого контрола на наличие ошибок\
      Object.values(this.form.controls).forEach(control => {
        if (control.errors !== null) {
          output = { required: ErrorMessage.VALIDATION_UNFILLED_CRITERIA };
        }
      });
    }
    return output;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorChanged = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.controlDisabled = disabled;
    if (this.form)
      this.disabled
        ? this.form.disable({ emitEvent: false })
        : this.form.enable({ emitEvent: false });
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach(subscription => subscription.unsubscribe());
  }

  private createFormControls(criteria: EvaluationCriterion[]): void {
    this.subscriptions$().forEach(subscription => subscription.unsubscribe());
    this.subscriptions$.set([]);
    const formGroupControls: Record<string, FormControl> = {};

    criteria.forEach(criterion => {
      formGroupControls[criterion.id] = evaluationCriterionControl(criterion);
    });

    this.form = new FormGroup(formGroupControls);
    if (this.pendingValue) this.form.patchValue(this.pendingValue, { emitEvent: false });

    if (this.disabled) {
      this.form.disable({ emitEvent: false });
    }
    this.validatorChanged();
  }

  private trackFormValueChange(): void {
    const trackChanged$ = this.form.valueChanges.subscribe(val => {
      this.onChange(val);
      this.onTouched();
      this.validatorChanged();
    });

    this.subscriptions$().push(trackChanged$);
  }
}
