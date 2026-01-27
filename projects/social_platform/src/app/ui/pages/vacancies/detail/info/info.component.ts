/** @format */

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ControlErrorPipe, ParseBreaksPipe, ParseLinksPipe, ValidationService } from "@corelib";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { SalaryTransformPipe } from "projects/core/src/lib/pipes/transformers/salary-transform.pipe";
import { map, Subscription } from "rxjs";
import { CapitalizePipe } from "projects/core/src/lib/pipes/formatters/capitalize.pipe";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "projects/core/src/lib/pipes/user/user-links.pipe";
import { VacancyService } from "projects/social_platform/src/app/api/vacancy/vacancy.service";
import { VacancyDetailInfoService } from "projects/social_platform/src/app/api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "projects/social_platform/src/app/api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";

/**
 * Компонент отображения детальной информации о вакансии
 *
 * Основная функциональность:
 * - Отображение полной информации о вакансии (описание, навыки, условия)
 * - Показ информации о проекте, к которому относится вакансия
 * - Кнопки действий: "Откликнуться" и "Прокачать себя"
 * - Модальное окно с предложением подписки на обучение
 * - Адаптивное отображение с возможностью сворачивания/разворачивания контента
 *
 * Управление контентом:
 * - Автоматическое определение необходимости кнопки "Читать полностью"
 * - Сворачивание длинного описания и списка навыков
 * - Парсинг ссылок и переносов строк в описании
 *
 * Интеграция с сервисами:
 * - VacancyService - получение данных вакансии через резолвер
 * - ProjectService - загрузка информации о проекте
 * - SubscriptionPlansService - получение планов подписки
 * - AuthService - информация о текущем пользователе
 *
 * Жизненный цикл:
 * - OnInit: загрузка данных вакансии и проекта, подписка на планы
 * - AfterViewInit: определение необходимости кнопок "Читать полностью"
 * - OnDestroy: отписка от всех активных подписок
 *
 * @property {Vacancy} vacancy - объект вакансии с полной информацией
 * @property {Project} project - объект проекта, к которому относится вакансия
 * @property {boolean} readFullDescription - состояние развернутого описания
 * @property {boolean} readFullSkills - состояние развернутого списка навыков
 *
 * @selector app-detail
 * @standalone true - автономный компонент
 */
@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
  imports: [
    IconComponent,
    TagComponent,
    ButtonComponent,
    ModalComponent,
    RouterModule,
    ReactiveFormsModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    TruncatePipe,
    SalaryTransformPipe,
    CapitalizePipe,
    UserLinksPipe,
    ControlErrorPipe,
    AvatarComponent,
    UploadFileComponent,
    TextareaComponent,
  ],
  providers: [VacancyDetailInfoService, VacancyDetailUIInfoService],
  standalone: true,
})
export class VacancyInfoComponent implements OnInit {
  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);
  private readonly expandService = inject(ExpandService);

  protected readonly vacancy = this.vacancyDetailUIInfoService.vacancy;

  /** Форма отправки отклика */
  protected readonly sendForm = this.vacancyDetailUIInfoService.sendForm;
  protected readonly sendFormIsSubmitting = this.vacancyDetailUIInfoService.sendFormIsSubmitting;

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly skillsExpandable = this.expandService.skillsExpandable;

  protected readonly readFullDescription = this.expandService.readFullDescription;
  protected readonly readFullSkills = this.expandService.readFullSkills;

  /** Флаг отображения модального окна с результатом */
  protected readonly resultModal = this.vacancyDetailUIInfoService.resultModal;
  protected readonly openModal = this.vacancyDetailUIInfoService.openModal;

  /** Объект с сообщениями об ошибках */
  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.vacancyDetailInfoService.initializeDetailInfo();
    this.vacancyDetailInfoService.initializeDetailInfoQueryParams();
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.vacancyDetailInfoService.initCheckDescription(descElement);

    const skillsElement = this.skillsEl?.nativeElement;
    this.vacancyDetailInfoService.initCheckSkills(skillsElement);
  }

  ngOnDestroy(): void {
    this.vacancyDetailInfoService.destroy();
  }

  closeSendResponseModal(): void {
    this.vacancyDetailInfoService.closeSendResponseModal();
  }

  /**
   * Обработчик отправки формы
   * Валидирует форму и отправляет отклик на сервер
   */
  onSubmit(): void {
    this.vacancyDetailInfoService.submitVacancyResponse();
  }

  /**
   * Раскрытие/сворачивание описания профиля
   * @param elem - DOM элемент описания
   * @param expandedClass - CSS класс для раскрытого состояния
   * @param isExpanded - текущее состояние (раскрыто/свернуто)
   */
  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    this.expandService.onExpand("description", elem, expandedClass, isExpanded);
  }

  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    this.expandService.onExpand("skills", elem, expandedClass, isExpanded);
  }

  protected openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
