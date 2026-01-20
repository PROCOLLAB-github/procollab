/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Params } from "@angular/router";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";

@Injectable()
export class VacancyDetailUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly vacancy = signal<Vacancy | undefined>(undefined);

  readonly openModal = signal<boolean>(false);
  readonly resultModal = signal<boolean>(false);
  readonly sendFormIsSubmitting = signal<boolean>(false);

  // Создание формы отклика с валидацией
  readonly sendForm = this.fb.group({
    whyMe: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    accompanyingFile: ["", Validators.required],
  });

  applySetVacancies(vacancy: Vacancy): void {
    this.vacancy.set(vacancy);
  }

  applyNoResponseOpenModal(data: Params): void {
    if (data["sendResponse"]) {
      this.openModal.set(true);
    }
  }

  applySubmitVacancyResponse(): void {
    this.sendFormIsSubmitting.set(false);
    this.resultModal.set(true);
    this.applyNoResponseCloseModal();
  }

  applyErrorFormSubmit(): void {
    this.sendFormIsSubmitting.set(false);
  }

  applyNoResponseCloseModal(): void {
    this.openModal.set(false);
  }
}
