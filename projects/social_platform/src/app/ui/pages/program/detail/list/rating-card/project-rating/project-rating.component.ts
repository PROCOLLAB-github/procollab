/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
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
  Validators,
  ValidationErrors,
  AbstractControl,
} from "@angular/forms";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { noop, Subscription } from "rxjs";
import { BooleanCriterionComponent } from "./components/boolean-criterion/boolean-criterion.component";
import { RangeCriterionInputComponent } from "./components/range-criterion-input/range-criterion-input.component";
import { ControlErrorPipe } from "@corelib";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { ErrorMessage } from "@core/lib/models/error/error-message";

/** Оценка проекта по числовым, булевым и текстовым критериям через ControlValueAccessor. */
@Component({
  selector: "app-project-rating",
  imports: [
    CommonModule,
    TextareaComponent,
    RangeCriterionInputComponent,
    BooleanCriterionComponent,
    ReactiveFormsModule,
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
  set criteria(val: ProjectRatingCriterion[]) {
    if (!val) return;
    this._criteria.set(val);
    this.createFormControls(val);
    this.trackFormValueChange();
    this.applyWrittenValue();
    this.emitCurrentValue();
  }

  get criteria(): ProjectRatingCriterion[] {
    return this._criteria();
  }

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    if (this.form) {
      value ? this.form.disable() : this.form.enable();
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  private _disabled = false;

  readonly currentUserId = input<number>();

  /** Сигнал для хранения критериев оценки */
  _criteria = signal<ProjectRatingCriterion[]>([]);

  /** Форма для управления всеми критериями оценки */
  form!: FormGroup;

  errorMessage = ErrorMessage;

  /** Creates FormControls per criterion type. */
  controlCreators: Record<string, (val: number | string) => FormControl> = {
    // Числовой критерий - обязательное поле
    int: val => new FormControl<number>(<number>val, [Validators.required]),
    // Булевый критерий - преобразование строки в boolean
    bool: val => new FormControl<boolean>(val ? JSON.parse((val as string).toLowerCase()) : false),
    // Строковый критерий - без валидации (комментарии опциональны)
    str: val => new FormControl<string>(<string>val, Validators.maxLength(50)),
  };

  /** Сигнал для хранения подписок */
  subscriptions$ = signal<Subscription[]>([]);

  onChange: (val: RatingFormValue) => void = noop;
  onTouched: () => void = noop;
  private onChangeRegistered = false;
  private writeValueCalled = false;
  private writtenValue: RatingFormValue | null = null;

  writeValue(val: RatingFormValue | null): void {
    this.writeValueCalled = true;
    this.writtenValue = val;
    this.applyWrittenValue();
    this.emitCurrentValue();
  }

  registerOnChange(fn: (v: RatingFormValue) => void): void {
    this.onChange = fn;
    this.onChangeRegistered = true;
    this.emitCurrentValue();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(_: AbstractControl): ValidationErrors | null {
    let output: ValidationErrors | null = null;

    if (this.form.invalid) {
      // Проверка каждого контрола на наличие ошибок\
      Object.values(this.form.controls).forEach(control => {
        if (control.errors !== null) {
          output = { required: ErrorMessage.VALIDATION_UNFILLED_CRITERIA };
        }
      });
    }
    return output;
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach(subscription => subscription.unsubscribe());
  }

  private createFormControls(criteria: ProjectRatingCriterion[]): void {
    const formGroupControls: Record<string, FormControl> = {};

    criteria.forEach(criterion => {
      const controlCreator = this.controlCreators[criterion.type];
      formGroupControls[criterion.id] = controlCreator(criterion.value);
    });

    this.form = new FormGroup(formGroupControls);

    if (this.disabled) {
      this.form.disable();
    }
  }

  private trackFormValueChange(): void {
    this.subscriptions$().forEach(subscription => subscription.unsubscribe());
    this.subscriptions$.set([]);

    const trackChanged$ = this.form.valueChanges.subscribe(() => {
      this.onChange(this.form.getRawValue() as RatingFormValue);
    });

    this.subscriptions$().push(trackChanged$);
  }

  private applyWrittenValue(): void {
    if (!this.form || !this.writtenValue) return;
    this.form.patchValue(this.writtenValue, { emitEvent: false });
  }

  private emitCurrentValue(): void {
    if (!this.form || !this.onChangeRegistered || !this.writeValueCalled) return;
    this.onChange(this.form.getRawValue() as RatingFormValue);
  }
}

type RatingFormValue = Record<string, string | number | boolean>;
