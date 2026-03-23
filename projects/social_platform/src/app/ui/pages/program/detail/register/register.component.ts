/** @format */

import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe, ValidationService } from "@corelib";
import { BarComponent, ButtonComponent, InputComponent } from "@ui/components";
import { KeyValuePipe } from "@angular/common";
import { RegisterProgramUseCase } from "projects/social_platform/src/app/api/program/use-cases/register-program.use-case";
import { ProgramDataSchema } from "projects/social_platform/src/app/domain/program/program.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramRegisterComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly registerProgramUseCase = inject(RegisterProgramUseCase);

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService
  ) {}

  registerForm?: FormGroup;

  schema?: ProgramDataSchema;

  ngOnInit(): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(schema => {
        this.schema = schema;

        const group: Record<string, any> = {};
        for (const cKey in schema) {
          group[cKey] = ["", [Validators.required]];
        }

        this.registerForm = this.fb.group(group);
      });
  }

  onSubmit(): void {
    if (this.registerForm && !this.validationService.getFormValidation(this.registerForm)) {
      return;
    }

    this.registerProgramUseCase
      .execute(Number(this.route.snapshot.params["programId"]), this.registerForm?.value ?? {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.router
          .navigateByUrl(`/office/program/${this.route.snapshot.params["programId"]}`)
          .then(() => this.logger.debug("Route changed from ProgramRegisterComponent"));
      });
  }
}
