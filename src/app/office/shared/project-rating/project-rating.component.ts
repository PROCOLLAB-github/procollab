/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  forwardRef,
  signal,
} from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from "@angular/forms";
import { InputComponent } from "@ui/components";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { ProjectRatingCriterion } from "@office/program/models/project-rating-criterion";
import { Subscription, noop } from "rxjs";
import { BooleanCriterionComponent } from "./components/boolean-criterion/boolean-criterion.component";
import { RangeCriterionInputComponent } from "./components/range-criterion-input/range-criterion-input.component";
import { ErrorMessage } from "@error/models/error-message";

@Component({
  selector: "app-project-rating",
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
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
  }

  get criteria(): ProjectRatingCriterion[] {
    return this._criteria();
  }

  _criteria = signal<ProjectRatingCriterion[]>([]);

  form!: FormGroup;

  controlCreators: Record<string, (val: number | string) => FormControl> = {
    int: val => new FormControl<number>(<number>val, [Validators.required]),
    bool: val => new FormControl<boolean>(val ? JSON.parse((val as string).toLowerCase()) : false),
    str: val => new FormControl<string>(<string>val),
  };

  subscriptions$ = signal<Subscription[]>([]);

  onChange: (val: unknown) => void = noop;
  onTouched: () => void = noop;

  writeValue(val: typeof this.form.value): void {
    if (val) {
      this.form.patchValue(val);
    }
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(_: AbstractControl): ValidationErrors | null {
    let output: ValidationErrors | null = null;

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.errors !== null) {
          output = { required: ErrorMessage.VALIDATION_UNFILLED_CRITERIA };
        }
      });
    }
    return output;
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  private createFormControls(criteria: ProjectRatingCriterion[]): void {
    const formGroupControls: Record<string, FormControl> = {};

    criteria.forEach(criterion => {
      const controlCreator = this.controlCreators[criterion.type];

      formGroupControls[criterion.id] = controlCreator(criterion.value);
    });

    this.form = new FormGroup(formGroupControls);
  }

  private trackFormValueChange(): void {
    const trackChanged$ = this.form.valueChanges.subscribe(val => {
      this.onChange(val);
    });

    this.subscriptions$().push(trackChanged$);
  }
}
