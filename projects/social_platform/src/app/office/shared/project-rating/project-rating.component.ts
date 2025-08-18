/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
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
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { ProjectRatingCriterion } from "@office/program/models/project-rating-criterion";
import { noop, Subscription } from "rxjs";
import { BooleanCriterionComponent } from "./components/boolean-criterion/boolean-criterion.component";
import { RangeCriterionInputComponent } from "./components/range-criterion-input/range-criterion-input.component";
import { ErrorMessage } from "@error/models/error-message";

/**
 * Компонент рейтинга проекта
 * Предоставляет интерфейс для оценки проекта по различным критериям
 * Поддерживает три типа критериев:
 * - int: числовая оценка в диапазоне (например, от 1 до 10)
 * - bool: булевая оценка (да/нет)
 * - str: текстовый комментарий
 *
 * Реализует ControlValueAccessor для интеграции с Angular Forms
 * и Validator для валидации введенных данных
 */
@Component({
  selector: "app-project-rating",
  standalone: true,
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
      // Регистрация как ControlValueAccessor для работы с формами
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProjectRatingComponent),
      multi: true,
    },
    {
      // Регистрация как Validator для валидации
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ProjectRatingComponent),
      multi: true,
    },
  ],
})
export class ProjectRatingComponent implements OnDestroy, ControlValueAccessor, Validator {
  /**
   * Сеттер для критериев оценки
   * При установке новых критериев создает соответствующие FormControl'ы
   * и настраивает отслеживание изменений
   * @param val - массив критериев для оценки проекта
   */
  @Input({ required: true })
  set criteria(val: ProjectRatingCriterion[]) {
    if (!val) return;
    this._criteria.set(val);
    this.createFormControls(val);
    this.trackFormValueChange();
  }

  /**
   * Геттер для получения текущих критериев
   * @returns массив критериев оценки
   */
  get criteria(): ProjectRatingCriterion[] {
    return this._criteria();
  }

  /** Сигнал для хранения критериев оценки */
  _criteria = signal<ProjectRatingCriterion[]>([]);

  /** Форма для управления всеми критериями оценки */
  form!: FormGroup;

  /**
   * Объект с функциями-создателями FormControl для разных типов критериев
   * Каждый тип критерия имеет свою логику создания контрола и валидации
   */
  controlCreators: Record<string, (val: number | string) => FormControl> = {
    // Числовой критерий - обязательное поле
    int: val => new FormControl<number>(<number>val, [Validators.required]),
    // Булевый критерий - преобразование строки в boolean
    bool: val => new FormControl<boolean>(val ? JSON.parse((val as string).toLowerCase()) : false),
    // Строковый критерий - без валидации (комментарии опциональны)
    str: val => new FormControl<string>(<string>val),
  };

  /** Сигнал для хранения подписок */
  subscriptions$ = signal<Subscription[]>([]);

  // Методы ControlValueAccessor
  /** Функция обратного вызова для уведомления об изменениях */
  onChange: (val: unknown) => void = noop;
  /** Функция обратного вызова для уведомления о касании */
  onTouched: () => void = noop;

  /**
   * Установка значения в компонент (ControlValueAccessor)
   * @param val - значения для установки в форму
   */
  writeValue(val: typeof this.form.value): void {
    if (val) {
      this.form.patchValue(val);
    }
  }

  /**
   * Регистрация функции обратного вызова для изменений (ControlValueAccessor)
   * @param fn - функция для вызова при изменении значений
   */
  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  /**
   * Регистрация функции обратного вызова для касания (ControlValueAccessor)\
   * @param fn - функция для вызова при касании компонента
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Валидация формы (Validator)
   * Проверяет, что все обязательные критерии заполнены
   * @param _ - контрол для валидации (не используется)
   * @returns объект с ошибками валидации или null если валидация прошла
   */
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

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$().forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Создание FormControl'ов для каждого критерия
   * Использует соответствующий создатель контрола в зависимости от типа критерия
   * @param criteria - массив критериев для создания контролов
   */
  private createFormControls(criteria: ProjectRatingCriterion[]): void {
    const formGroupControls: Record<string, FormControl> = {};

    criteria.forEach(criterion => {
      const controlCreator = this.controlCreators[criterion.type];
      formGroupControls[criterion.id] = controlCreator(criterion.value);
    });

    this.form = new FormGroup(formGroupControls);
  }

  /**
   * Настройка отслеживания изменений в форме
   * Подписывается на изменения значений и уведомляет родительский компонент
   */
  private trackFormValueChange(): void {
    const trackChanged$ = this.form.valueChanges.subscribe(val => {
      this.onChange(val);
    });

    this.subscriptions$().push(trackChanged$);
  }
}
