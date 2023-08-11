/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Subscription } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProgramDataSchema } from "@office/program/models/program.model";
import { ValidationService } from "@core/services";
import { ProgramService } from "@office/program/services/program.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
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
    if (!this.validationService.getFormValidation(this.registerForm)) {
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
