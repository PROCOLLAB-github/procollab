/** @format */

import { DestroyRef, ElementRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { filter, map } from "rxjs";
import { ValidationService } from "@corelib";
import { VacancyDetailUIInfoService } from "./ui/vacancy-detail-ui-info.service";
import { ExpandService } from "../../expand/expand.service";
import { SendVacancyResponseUseCase } from "../use-cases/send-vacancy-response.use-case";
import { loading } from "@domain/shared/async-state";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SnackbarService } from "@domain/shared/snackbar.service";

/** Управляет детальной страницей вакансии, раскрытием текста и отправкой отклика. */
@Injectable()
export class VacancyDetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sendVacancyResponseUseCase = inject(SendVacancyResponseUseCase);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly expandService = inject(ExpandService);
  private readonly snackbarService = inject(SnackbarService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly vacancy = this.vacancyDetailUIInfoService.vacancy;
  private readonly sendForm = this.vacancyDetailUIInfoService.sendForm;
  private readonly sendFormIsSubmitting$ = this.vacancyDetailUIInfoService.sendFormIsSubmitting$;

  initializeDetailInfo(): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        filter(Boolean),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(vacancy => {
        this.vacancyDetailUIInfoService.applySetVacancies(vacancy);
      });
  }

  initializeDetailInfoQueryParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => {
        this.vacancyDetailUIInfoService.applyNoResponseOpenModal(r);
      },
    });
  }

  initCheckDescription(descEl?: ElementRef): void {
    setTimeout(() => {
      this.expandService.checkExpandable("description", !!this.vacancy()?.description, descEl);
    }, 150);
  }

  initCheckSkills(descEl?: ElementRef): void {
    setTimeout(() => {
      this.expandService.checkExpandable("skills", !!this.vacancy()?.requiredSkills.length, descEl);
    }, 150);
  }

  submitVacancyResponse(): void {
    if (!this.validationService.getFormValidation(this.sendForm)) {
      return;
    }

    this.sendFormIsSubmitting$.set(loading());

    this.sendVacancyResponseUseCase
      .execute(Number(this.route.snapshot.paramMap.get("vacancyId")), this.sendForm.value as any)
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.vacancyDetailUIInfoService.applyErrorFormSubmit();
            if (result.error.cause) {
              this.snackbarService.error(
                "Не удалось отправить отклик. Вы уже отправили отклик на эту вакансию",
              );
            } else {
              this.snackbarService.error(
                "Не удалось отправить отклик. Возможно, вакансия закрыта.",
              );
            }
            return;
          }

          this.vacancyDetailUIInfoService.applySubmitVacancyResponse();
        },
      });
  }

  closeSendResponseModal(): void {
    this.vacancyDetailUIInfoService.applyNoResponseCloseModal();

    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
  }
}
