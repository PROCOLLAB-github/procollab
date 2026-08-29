/** @format */

import { DestroyRef, ElementRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, EMPTY, filter, finalize, map, switchMap, tap } from "rxjs";
import { FileService, ValidationService } from "@corelib";
import { VacancyDetailUIInfoService } from "./ui/vacancy-detail-ui-info.service";
import { ExpandService } from "../../expand/expand.service";
import { SendVacancyResponseUseCase } from "../use-cases/send-vacancy-response.use-case";
import { loading } from "@domain/shared/async-state";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { GetVacancyResponsesUseCase } from "../use-cases/get-vacancy-responses.use-case";
import { AcceptResponseUseCase } from "../use-cases/accept-response.use-case";
import { RejectResponseUseCase } from "../use-cases/reject-response.use-case";
import {
  getSendVacancyResponseError,
  getVacancyResponsesLoadError,
} from "../vacancy-response-error";
import { SendVacancyResponsePayload } from "@domain/vacancy/vacancy-response.model";
import { DownloadCvUseCase } from "@api/auth/use-cases/download-cv.use-case";

/** Управляет детальной страницей вакансии, раскрытием текста и отправкой отклика. */
@Injectable()
export class VacancyDetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sendVacancyResponseUseCase = inject(SendVacancyResponseUseCase);
  private readonly getVacancyResponsesUseCase = inject(GetVacancyResponsesUseCase);
  private readonly acceptResponseUseCase = inject(AcceptResponseUseCase);
  private readonly rejectResponseUseCase = inject(RejectResponseUseCase);
  private readonly downloadCvUseCase = inject(DownloadCvUseCase);
  private readonly fileService = inject(FileService);
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
        if (r["manageResponses"] === true || r["manageResponses"] === "true") {
          this.openVacancyResponses();
          return;
        }

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
    if (
      !this.vacancy()?.canRespond ||
      this.sendFormIsSubmitting$().status === "loading" ||
      this.vacancyDetailUIInfoService.procollabCvLoading()
    ) {
      return;
    }

    if (!this.validationService.getFormValidation(this.sendForm)) {
      return;
    }

    this.sendFormIsSubmitting$.set(loading());

    this.sendVacancyResponseUseCase
      .execute(
        Number(this.route.snapshot.paramMap.get("vacancyId")),
        this.sendForm.getRawValue() as SendVacancyResponsePayload,
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.vacancyDetailUIInfoService.applyErrorFormSubmit();
            this.snackbarService.error(getSendVacancyResponseError(result.error.cause));
            return;
          }

          this.vacancyDetailUIInfoService.applySubmitVacancyResponse();
          this.snackbarService.success("Отклик успешно отправлен");
        },
      });
  }

  attachProcollabCv(): void {
    if (
      this.vacancyDetailUIInfoService.procollabCvLoading() ||
      this.sendForm.controls.accompanyingFile.value
    ) {
      return;
    }

    this.vacancyDetailUIInfoService.applyProcollabCvLoading(true);
    this.downloadCvUseCase
      .execute()
      .pipe(
        switchMap(result => {
          if (!result.ok) {
            this.snackbarService.error(this.getProcollabCvDownloadError(result.error.cause));
            return EMPTY;
          }

          const file = new File([result.value], "PROCOLLAB_CV.pdf", {
            type: "application/pdf",
          });

          return this.fileService.uploadFile(file).pipe(
            tap(response => {
              this.vacancyDetailUIInfoService.applyProcollabCvAttached(response.url);
              this.snackbarService.success("Резюме PROCOLLAB прикреплено");
            }),
            catchError(() => {
              this.snackbarService.error(
                "CV сформировано, но не удалось прикрепить файл. Попробуйте ещё раз.",
              );
              return EMPTY;
            }),
          );
        }),
        finalize(() => this.vacancyDetailUIInfoService.applyProcollabCvLoading(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  openVacancyResponses(): void {
    const vacancy = this.vacancy();
    if (!vacancy?.canManageResponses) return;

    this.vacancyDetailUIInfoService.applyResponsesModalOpen();
    this.loadVacancyResponses();
  }

  closeVacancyResponses(): void {
    this.vacancyDetailUIInfoService.applyResponsesModalClose();
  }

  loadVacancyResponses(): void {
    const vacancy = this.vacancy();
    if (!vacancy?.canManageResponses || !Number.isInteger(vacancy.id) || vacancy.id <= 0) return;

    this.vacancyDetailUIInfoService.applyResponsesLoading();
    this.getVacancyResponsesUseCase
      .execute(vacancy.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.ok) {
          this.vacancyDetailUIInfoService.applyResponsesLoaded(result.value);
          return;
        }

        this.vacancyDetailUIInfoService.applyResponsesError(
          getVacancyResponsesLoadError(result.error.cause),
        );
      });
  }

  acceptVacancyResponse(responseId: number): void {
    if (this.vacancyDetailUIInfoService.processingResponseIds().includes(responseId)) return;

    this.vacancyDetailUIInfoService.applyResponseProcessing(responseId, true);
    this.acceptResponseUseCase
      .execute(responseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          this.vacancyDetailUIInfoService.applyResponseProcessing(responseId, false);
          this.snackbarService.error("Не удалось принять кандидата. Попробуйте ещё раз");
          return;
        }

        this.vacancyDetailUIInfoService.applyVacancyAccepted();
        this.vacancyDetailUIInfoService.applyResponseProcessing(responseId, false);
        this.snackbarService.success("Кандидат принят в проект");
        this.loadVacancyResponses();
      });
  }

  declineVacancyResponse(responseId: number): void {
    if (this.vacancyDetailUIInfoService.processingResponseIds().includes(responseId)) return;

    this.vacancyDetailUIInfoService.applyResponseProcessing(responseId, true);
    this.rejectResponseUseCase
      .execute(responseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          this.vacancyDetailUIInfoService.applyResponseProcessing(responseId, false);
          this.snackbarService.error("Не удалось отклонить отклик. Попробуйте ещё раз");
          return;
        }

        this.vacancyDetailUIInfoService.applyResponseProcessing(responseId, false);
        this.snackbarService.success("Отклик отклонён");
        this.loadVacancyResponses();
      });
  }

  closeSendResponseModal(): void {
    this.vacancyDetailUIInfoService.applyNoResponseCloseModal();

    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
  }

  private getProcollabCvDownloadError(cause: unknown): string {
    const error = this.asRecord(cause);
    const responseBody = this.asRecord(error?.["error"]);
    const retryValue = responseBody?.["seconds_after_retry"] ?? responseBody?.["secondsAfterRetry"];
    const retrySeconds =
      typeof retryValue === "number" && Number.isFinite(retryValue) && retryValue >= 0
        ? Math.ceil(retryValue)
        : null;

    if (error?.["status"] === 400) {
      return retrySeconds === null
        ? "Не удалось сформировать CV. Попробуйте немного позже."
        : `CV недавно формировалось. Попробуйте снова через ${retrySeconds} сек.`;
    }

    return "Не удалось сформировать CV PROCOLLAB.";
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
  }
}
