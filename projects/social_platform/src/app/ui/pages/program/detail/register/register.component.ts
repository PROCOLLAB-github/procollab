/** @format */

import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe, ValidationService } from "@corelib";
import { BarComponent, ButtonComponent, InputComponent } from "@ui/primitives";
import { KeyValuePipe } from "@angular/common";
import { RegisterProgramUseCase } from "@api/program/use-cases/register-program.use-case";
import { ProgramDataSchema } from "@domain/program/program.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppRoutes } from "@api/paths/app-routes";

/** Форма регистрации пользователя в программе с динамическими полями на основе схемы. */
@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrl: "./register.component.scss",
    imports: [
        ReactiveFormsModule,
        InputComponent,
        ButtonComponent,
        KeyValuePipe,
        ControlErrorPipe,
        BarComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
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
          .navigateByUrl(AppRoutes.program.detail(this.route.snapshot.params["programId"]))
          .then(() => this.logger.debug("Route changed from ProgramRegisterComponent"));
      });
  }
}
