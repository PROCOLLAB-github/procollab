/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ButtonComponent } from "@ui/primitives";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { IconComponent } from "@uilib";
import { ReactiveFormsModule } from "@angular/forms";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { VacanciesRightSideComponent } from "./components/vacancies-right-side/vacancies-right-side.component";
import { VacanciesLeftSideComponent } from "./components/vacancies-left-side/vacancies-left-side.component";
import { AppRoutes } from "@api/paths/app-routes";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ControlErrorPipe } from "@corelib";
import { UploadFileComponent } from "@ui/primitives/upload-file/upload-file.component";

/** Отображает детальную информацию о вакансии с возможностью отклика. */
@Component({
    selector: "app-detail",
    templateUrl: "./info.component.html",
    styleUrl: "./info.component.scss",
    imports: [
        IconComponent,
        ButtonComponent,
        ModalComponent,
        RouterModule,
        ReactiveFormsModule,
        VacanciesRightSideComponent,
        VacanciesLeftSideComponent,
        TextareaComponent,
        ControlErrorPipe,
        UploadFileComponent,
    ],
    providers: [VacancyDetailInfoService, VacancyDetailUIInfoService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacancyInfoComponent implements OnInit {
  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);

  protected readonly vacancy = this.vacancyDetailUIInfoService.vacancy;

  protected readonly AppRoutes = AppRoutes;

  /** Флаг отображения модального окна с результатом */
  protected readonly resultModal = this.vacancyDetailUIInfoService.resultModal;
  protected readonly openModal = this.vacancyDetailUIInfoService.openModal;

  /** Форма отправки отклика */
  protected readonly sendForm = this.vacancyDetailUIInfoService.sendForm;
  protected readonly sendFormIsSubmitting =
    this.vacancyDetailUIInfoService.sendFormIsSubmittingFlag;

  /** Объект с сообщениями об ошибках */
  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.vacancyDetailInfoService.initializeDetailInfo();
    this.vacancyDetailInfoService.initializeDetailInfoQueryParams();
  }

  ngOnDestroy(): void {
    this.vacancyDetailInfoService.destroy();
  }

  onOpenResponseModal(): void {
    this.vacancyDetailUIInfoService.applyResponseModalOpen();
  }

  onSubmit(): void {
    this.vacancyDetailInfoService.submitVacancyResponse();
  }

  closeSendResponseModal(): void {
    this.vacancyDetailInfoService.closeSendResponseModal();
  }

  protected openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
