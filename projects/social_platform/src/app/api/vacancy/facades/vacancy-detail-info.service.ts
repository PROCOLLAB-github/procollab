/** @format */

import { ElementRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { filter, map, Subject, takeUntil } from "rxjs";
import { ValidationService } from "@corelib";
import { VacancyService } from "../vacancy.service";
import { VacancyDetailUIInfoService } from "./ui/vacancy-detail-ui-info.service";
import { ExpandService } from "../../expand/expand.service";

@Injectable()
export class VacancyDetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vacancyService = inject(VacancyService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly expandService = inject(ExpandService);

  private readonly destroy$ = new Subject<void>();

  private readonly vacancy = this.vacancyDetailUIInfoService.vacancy;
  private readonly sendForm = this.vacancyDetailUIInfoService.sendForm;
  private readonly sendFormIsSubmitting = this.vacancyDetailUIInfoService.sendFormIsSubmitting;

  initializeDetailInfo(): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        filter(Boolean),
        takeUntil(this.destroy$)
      )
      .subscribe(vacancy => {
        this.vacancyDetailUIInfoService.applySetVacancies(vacancy);
      });
  }

  initializeDetailInfoQueryParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe({
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

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitVacancyResponse(): void {
    if (!this.validationService.getFormValidation(this.sendForm)) {
      return;
    }

    this.sendFormIsSubmitting.set(true);

    this.vacancyService
      .sendResponse(
        Number(this.route.snapshot.paramMap.get("vacancyId")),
        this.sendForm.value as any
      )
      .subscribe({
        next: () => {
          this.vacancyDetailUIInfoService.applySubmitVacancyResponse();
        },
        error: () => {
          this.vacancyDetailUIInfoService.applyErrorFormSubmit();
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
