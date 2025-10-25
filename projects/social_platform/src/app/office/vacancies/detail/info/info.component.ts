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
import { AuthService } from "@auth/services";
import {
  ControlErrorPipe,
  ParseBreaksPipe,
  ParseLinksPipe,
  SubscriptionPlan,
  SubscriptionPlansService,
  ValidationService,
} from "@corelib";
import { Project } from "@office/models/project.model";
import { Vacancy } from "@office/models/vacancy.model";
import { ProjectService } from "@office/services/project.service";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { SalaryTransformPipe } from "projects/core/src/lib/pipes/salary-transform.pipe";
import { map, Subscription } from "rxjs";
import { CapitalizePipe } from "projects/core/src/lib/pipes/capitalize.pipe";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { VacancyService } from "@office/services/vacancy.service";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";

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
  standalone: true,
  imports: [
    IconComponent,
    TagComponent,
    ButtonComponent,
    ModalComponent,
    RouterModule,
    ReactiveFormsModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    SalaryTransformPipe,
    CapitalizePipe,
    UserLinksPipe,
    ControlErrorPipe,
    AvatarComponent,
    UploadFileComponent,
    TextareaComponent,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class VacancyInfoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly validationService = inject(ValidationService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  constructor() {
    // Создание формы отклика с валидацией
    this.sendForm = this.fb.group({
      whyMe: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      accompanyingFile: ["", Validators.required],
    });
  }

  vacancy!: Vacancy;

  /** Объект с сообщениями об ошибках */
  errorMessage = ErrorMessage;

  descriptionExpandable!: boolean;
  skillsExpandable!: boolean;

  /** Форма отправки отклика */
  sendForm: FormGroup;

  /** Флаг состояния отправки формы */
  sendFormIsSubmitting = false;

  /** Флаг отображения модального окна с результатом */
  resultModal = false;

  openModal = signal<boolean>(false);
  readFullDescription = false;
  readFullSkills = false;

  private subscriptions$: Subscription[] = [];

  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe((vacancy: Vacancy) => {
      this.vacancy = vacancy;
    });
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    const skillsElement = this.skillsEl?.nativeElement;
    this.skillsExpandable = skillsElement?.clientHeight < skillsElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * Обработчик отправки формы
   * Валидирует форму и отправляет отклик на сервер
   */
  onSubmit(): void {
    // Проверка валидности формы
    if (!this.validationService.getFormValidation(this.sendForm)) {
      return;
    }

    // Установка флага загрузки
    this.sendFormIsSubmitting = true;

    // Отправка отклика на сервер
    this.vacancyService
      .sendResponse(Number(this.route.snapshot.paramMap.get("vacancyId")), this.sendForm.value)
      .subscribe({
        next: () => {
          // Успешная отправка - показываем модальное окно
          this.sendFormIsSubmitting = false;
          this.resultModal = true;
          this.openModal.set(false);
        },
        error: () => {
          // Ошибка отправки - снимаем флаг загрузки
          this.sendFormIsSubmitting = false;
        },
      });
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullSkills = !isExpanded;
  }

  openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
