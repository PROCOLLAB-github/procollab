/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../auth/services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "../../../error/models/error-message";
import { VacancyService } from "../../services/vacancy.service";
import { ValidationService } from "../../../core/services";
import { ActivatedRoute } from "@angular/router";
import { NavService } from "../../services/nav.service";

@Component({
  selector: "app-send",
  templateUrl: "./send.component.html",
  styleUrls: ["./send.component.scss"],
})
export class VacancySendComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private vacancyService: VacancyService,
    private validationService: ValidationService,
    private route: ActivatedRoute,
    private navService: NavService
  ) {
    this.sendForm = this.fb.group({
      text: ["", [Validators.required, Validators.maxLength(2000)]],
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
