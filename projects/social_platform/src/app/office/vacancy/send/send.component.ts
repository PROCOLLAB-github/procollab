/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { VacancyService } from "@services/vacancy.service";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NavService } from "@services/nav.service";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { BarComponent, ButtonComponent, IconComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { AsyncPipe } from "@angular/common";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { noteList } from "projects/core/src/consts/note-list";
import { BackComponent } from "@uilib";

/**
 * Компонент для отправки отклика на вакансию
 * Позволяет пользователю отправить мотивационное письмо и резюме на вакансию
 */
@Component({
  selector: "app-send",
  templateUrl: "./send.component.html",
  styleUrl: "./send.component.scss",
  standalone: true,
  imports: [
    ModalComponent,
    IconComponent,
    RouterLink,
    ButtonComponent,
    AvatarComponent,
    TagComponent,
    ReactiveFormsModule,
    TextareaComponent,
    AsyncPipe,
    ControlErrorPipe,
    UserRolePipe,
    BarComponent,
    UploadFileComponent,
    BackComponent,
  ],
})
export class VacancySendComponent implements OnInit {
  /**
   * Конструктор компонента
   * @param authService - сервис аутентификации для получения данных текущего пользователя
   * @param fb - FormBuilder для создания реактивных форм
   * @param vacancyService - сервис для работы с вакансиями
   * @param validationService - сервис валидации форм
   * @param route - текущий маршрут для получения параметров
   * @param navService - сервис навигации для установки заголовка страницы
   */
  constructor(
    public readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly vacancyService: VacancyService,
    private readonly validationService: ValidationService,
    private readonly route: ActivatedRoute,
    private readonly navService: NavService
  ) {
    // Создание формы отклика с валидацией
    this.sendForm = this.fb.group({
      // Мотивационное письмо: обязательное поле, минимум 20 символов, максимум 2000
      whyMe: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      // Прикрепленный файл резюме: обязательное поле
      accompanyingFile: ["", Validators.required],
    });
  }

  /**
   * Инициализация компонента
   * Устанавливает заголовок страницы
   */
  ngOnInit(): void {
    this.navService.setNavTitle("Отклик на вакансию");
  }

  /** Объект с сообщениями об ошибках */
  errorMessage = ErrorMessage;
  /** Форма отправки отклика */
  sendForm: FormGroup;
  /** Флаг состояния отправки формы */
  sendFormIsSubmitting = false;
  /** Флаг отображения модального окна с результатом */
  resultModal = false;

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
        },
        error: () => {
          // Ошибка отправки - снимаем флаг загрузки
          this.sendFormIsSubmitting = false;
        },
      });
  }

  /** Список советов для подготовки отклика */
  readonly noteList = noteList;
}
