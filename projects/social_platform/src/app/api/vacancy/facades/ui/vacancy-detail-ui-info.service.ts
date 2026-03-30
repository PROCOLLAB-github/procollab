/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Params } from "@angular/router";
import { AsyncState, failure, initial, isLoading, success } from "@domain/shared/async-state";
import { Vacancy } from "@domain/vacancy/vacancy.model";

@Injectable()
export class VacancyDetailUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly vacancy = signal<Vacancy | undefined>(undefined);

  readonly openModal = signal<boolean>(false);
  readonly resultModal = signal<boolean>(false);
  readonly sendFormIsSubmitting$ = signal<AsyncState<void>>(initial());
  readonly sendFormIsSubmittingFlag = computed(() => isLoading(this.sendFormIsSubmitting$()));

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
      this.applyResponseModalOpen();
    }
  }

  applyResponseModalOpen(): void {
    this.openModal.set(true);
  }

  applySubmitVacancyResponse(): void {
    this.sendFormIsSubmitting$.set(success(undefined));
    this.resultModal.set(true);
    this.applyNoResponseCloseModal();
  }

  applyErrorFormSubmit(): void {
    this.sendFormIsSubmitting$.set(failure("vacancy_form_error"));
  }

  applyNoResponseCloseModal(): void {
    this.openModal.set(false);
  }
}
