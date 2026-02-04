/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { ReactiveFormsModule } from "@angular/forms";
import { VacancyDetailInfoService } from "projects/social_platform/src/app/api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "projects/social_platform/src/app/api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { VacanciesRightSideComponent } from "./components/vacancies-right-side/vacancies-right-side.component";
import { VacanciesLeftSideComponent } from "./components/vacancies-left-side/vacancies-left-side.component";

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
    ButtonComponent,
    ModalComponent,
    RouterModule,
    ReactiveFormsModule,
    VacanciesRightSideComponent,
    VacanciesLeftSideComponent,
  ],
  providers: [VacancyDetailInfoService, VacancyDetailUIInfoService],
  standalone: true,
})
export class VacancyInfoComponent implements OnInit {
  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);

  protected readonly vacancy = this.vacancyDetailUIInfoService.vacancy;

  /** Флаг отображения модального окна с результатом */
  protected readonly resultModal = this.vacancyDetailUIInfoService.resultModal;

  ngOnInit(): void {
    this.vacancyDetailInfoService.initializeDetailInfo();
    this.vacancyDetailInfoService.initializeDetailInfoQueryParams();
  }

  ngOnDestroy(): void {
    this.vacancyDetailInfoService.destroy();
  }

  protected openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
