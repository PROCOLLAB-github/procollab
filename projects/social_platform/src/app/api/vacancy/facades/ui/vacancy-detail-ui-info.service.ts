/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Params } from "@angular/router";
import {
  AsyncState,
  failure,
  initial,
  isFailure,
  isLoading,
  isSuccess,
  loading,
  success,
} from "@domain/shared/async-state";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { VacancyResponsesLoadError } from "../../vacancy-response-error";

/** UI-проекция детали вакансии: computed-сигналы для шаблона. */
@Injectable()
export class VacancyDetailUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly vacancy = signal<Vacancy | undefined>(undefined);

  readonly openModal = signal<boolean>(false);
  readonly responsesModal = signal(false);
  readonly responsesState =
    signal<AsyncState<VacancyResponse[], VacancyResponsesLoadError>>(initial());
  readonly responses = computed(() => {
    const state = this.responsesState();
    if (isSuccess(state)) return state.data;
    return "previous" in state ? (state.previous ?? []) : [];
  });
  readonly responsesLoading = computed(() => isLoading(this.responsesState()));
  readonly responsesError = computed(() => {
    const state = this.responsesState();
    return isFailure(state) ? state.error : null;
  });
  readonly processingResponseIds = signal<number[]>([]);
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
    if (data["sendResponse"] && this.vacancy()?.canRespond) {
      this.applyResponseModalOpen();
    }
  }

  applyResponseModalOpen(): void {
    if (this.vacancy()?.canRespond) this.openModal.set(true);
  }

  applySubmitVacancyResponse(): void {
    this.sendFormIsSubmitting$.set(success(undefined));
    this.vacancy.update(vacancy =>
      vacancy
        ? Object.assign(new Vacancy(), vacancy, {
            hasResponded: true,
            canRespond: false,
          })
        : vacancy,
    );
    this.applyNoResponseCloseModal();
  }

  applyErrorFormSubmit(): void {
    this.sendFormIsSubmitting$.set(failure("vacancy_form_error"));
  }

  applyNoResponseCloseModal(): void {
    this.openModal.set(false);
  }

  applyResponsesModalOpen(): void {
    if (this.vacancy()?.canManageResponses) this.responsesModal.set(true);
  }

  applyResponsesModalClose(): void {
    this.responsesModal.set(false);
  }

  applyResponsesLoading(): void {
    this.responsesState.set(loading(this.responses()));
  }

  applyResponsesLoaded(responses: VacancyResponse[]): void {
    this.responsesState.set(success(responses));
  }

  applyResponsesError(error: VacancyResponsesLoadError): void {
    this.responsesState.set(failure(error, this.responses()));
  }

  applyResponseProcessing(responseId: number, processing: boolean): void {
    this.processingResponseIds.update(responseIds =>
      processing
        ? responseIds.includes(responseId)
          ? responseIds
          : [...responseIds, responseId]
        : responseIds.filter(id => id !== responseId),
    );
  }

  applyVacancyAccepted(): void {
    this.vacancy.update(vacancy =>
      vacancy ? Object.assign(new Vacancy(), vacancy, { isActive: false }) : vacancy,
    );
  }
}
