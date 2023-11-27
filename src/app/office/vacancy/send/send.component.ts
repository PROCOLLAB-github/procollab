/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { VacancyService } from "@services/vacancy.service";
import { ValidationService } from "@core/services";
import { ActivatedRoute } from "@angular/router";
import { NavService } from "@services/nav.service";

@Component({
  selector: "app-send",
  templateUrl: "./send.component.html",
  styleUrl: "./send.component.scss",
})
export class VacancySendComponent implements OnInit {
  constructor(
    public readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly vacancyService: VacancyService,
    private readonly validationService: ValidationService,
    private readonly route: ActivatedRoute,
    private readonly navService: NavService
  ) {
    this.sendForm = this.fb.group({
      whyMe: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Отклик на вакансию");
  }

  errorMessage = ErrorMessage;
  sendForm: FormGroup;
  sendFormIsSubmitting = false;

  resultModal = false;

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.sendForm)) {
      return;
    }

    this.sendFormIsSubmitting = true;

    this.vacancyService
      .sendResponse(Number(this.route.snapshot.paramMap.get("vacancyId")), this.sendForm.value)
      .subscribe({
        next: () => {
          this.sendFormIsSubmitting = false;
          this.resultModal = true;
        },
        error: () => {
          this.sendFormIsSubmitting = false;
        },
      });
  }
}
