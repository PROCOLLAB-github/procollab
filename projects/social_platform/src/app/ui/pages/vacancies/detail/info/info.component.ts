/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/primitives";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { IconComponent } from "@uilib";
import { ReactiveFormsModule } from "@angular/forms";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { VacanciesRightSideComponent } from "./components/vacancies-right-side/vacancies-right-side.component";
import { VacanciesLeftSideComponent } from "./components/vacancies-left-side/vacancies-left-side.component";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ControlErrorPipe } from "@corelib";
import { UploadFileComponent } from "@ui/primitives/upload-file/upload-file.component";
import { VacancyResponsesComponent } from "./components/vacancy-responses/vacancy-responses.component";

/** Отображает детальную информацию о вакансии с возможностью отклика. */
@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
  imports: [
    IconComponent,
    ButtonComponent,
    ModalComponent,
    ReactiveFormsModule,
    VacanciesRightSideComponent,
    VacanciesLeftSideComponent,
    TextareaComponent,
    ControlErrorPipe,
    UploadFileComponent,
    VacancyResponsesComponent,
  ],
  providers: [VacancyDetailInfoService, VacancyDetailUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyInfoComponent implements OnInit {
  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);

  protected readonly vacancy = this.vacancyDetailUIInfoService.vacancy;

  protected readonly openModal = this.vacancyDetailUIInfoService.openModal;
  protected readonly responsesModal = this.vacancyDetailUIInfoService.responsesModal;
  protected readonly responses = this.vacancyDetailUIInfoService.responses;
  protected readonly responsesLoading = this.vacancyDetailUIInfoService.responsesLoading;
  protected readonly responsesError = this.vacancyDetailUIInfoService.responsesError;
  protected readonly processingResponseIds = this.vacancyDetailUIInfoService.processingResponseIds;

  /** Форма отправки отклика */
  protected readonly sendForm = this.vacancyDetailUIInfoService.sendForm;
  protected readonly sendFormIsSubmitting =
    this.vacancyDetailUIInfoService.sendFormIsSubmittingFlag;
  protected readonly procollabCvLoading = this.vacancyDetailUIInfoService.procollabCvLoading;

  /** Объект с сообщениями об ошибках */
  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.vacancyDetailInfoService.initializeDetailInfo();
    this.vacancyDetailInfoService.initializeDetailInfoQueryParams();
  }

  onOpenResponseModal(): void {
    this.vacancyDetailUIInfoService.applyResponseModalOpen();
  }

  onOpenResponses(): void {
    this.vacancyDetailInfoService.openVacancyResponses();
  }

  onCloseResponses(): void {
    this.vacancyDetailInfoService.closeVacancyResponses();
  }

  onRetryResponses(): void {
    this.vacancyDetailInfoService.loadVacancyResponses();
  }

  onAcceptResponse(responseId: number): void {
    this.vacancyDetailInfoService.acceptVacancyResponse(responseId);
  }

  onDeclineResponse(responseId: number): void {
    this.vacancyDetailInfoService.declineVacancyResponse(responseId);
  }

  onSubmit(): void {
    this.vacancyDetailInfoService.submitVacancyResponse();
  }

  onAttachProcollabCv(): void {
    this.vacancyDetailInfoService.attachProcollabCv();
  }

  closeSendResponseModal(): void {
    this.vacancyDetailInfoService.closeSendResponseModal();
  }

  protected openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
