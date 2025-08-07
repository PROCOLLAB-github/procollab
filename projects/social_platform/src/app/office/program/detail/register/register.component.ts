/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Subscription } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProgramDataSchema } from "@office/program/models/program.model";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { ProgramService } from "@office/program/services/program.service";
import { BarComponent, ButtonComponent, InputComponent } from "@ui/components";
import { KeyValuePipe } from "@angular/common";

/**
 * Компонент регистрации в программе
 *
 * Предоставляет форму для регистрации пользователя в программе.
 * Динамически генерирует поля формы на основе схемы данных программы.
 *
 * Принимает:
 * @param {Router} router - Для навигации после успешной регистрации
 * @param {ActivatedRoute} route - Для получения данных из резолвера
 * @param {FormBuilder} fb - Для создания реактивных форм
 * @param {ValidationService} validationService - Для валидации форм
 * @param {ProgramService} programService - Для отправки данных регистрации
 *
 * Данные из резолвера:
 * @property {ProgramDataSchema} schema - Схема дополнительных полей программы
 *
 * Форма:
 * @property {FormGroup} registerForm - Динамически генерируемая форма регистрации
 *
 * Жизненный цикл:
 * - OnInit: Получает схему из резолвера и создает форму с валидаторами
 * - OnDestroy: Отписывается от всех подписок
 *
 * Методы:
 * @method onSubmit() - Обработчик отправки формы
 *   - Валидирует форму
 *   - Отправляет данные через ProgramService
 *   - Перенаправляет на страницу программы при успехе
 *
 * Возвращает:
 * HTML шаблон с динамической формой регистрации
 */
@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    KeyValuePipe,
    ControlErrorPipe,
    BarComponent,
  ],
})
export class ProgramRegisterComponent implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly programService: ProgramService
  ) {}

  ngOnInit(): void {
    const route$ = this.route.data.pipe(map(r => r["data"])).subscribe(schema => {
      this.schema = schema;

      const group: Record<string, any> = {};
      for (const cKey in schema) {
        group[cKey] = ["", [Validators.required]];
      }

      this.registerForm = this.fb.group(group);
    });
    this.subscriptions$.push(route$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];

  registerForm?: FormGroup;

  schema?: ProgramDataSchema;

  onSubmit(): void {
    if (this.registerForm && !this.validationService.getFormValidation(this.registerForm)) {
      return;
    }

    this.programService
      .register(this.route.snapshot.params["programId"], this.registerForm?.value)
      .subscribe(() => {
        this.router
          .navigateByUrl(`/office/program/${this.route.snapshot.params["programId"]}`)
          .then(() => console.debug("Route changed from ProgramRegisterComponent"));
      });
  }
}
