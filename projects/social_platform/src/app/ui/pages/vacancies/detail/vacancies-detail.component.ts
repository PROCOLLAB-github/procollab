/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";
import { BarComponent } from "@ui/components";
import { map, Subscription } from "rxjs";
import { BackComponent } from "@uilib";
import { VacancyDetailInfoService } from "projects/social_platform/src/app/api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "projects/social_platform/src/app/api/vacancy/facades/ui/vacancy-detail-ui-info.service";

/**
 * Компонент детального просмотра вакансии
 *
 * Функциональность:
 * - Получает данные вакансии из резолвера через ActivatedRoute
 * - Отображает навигационную панель с кнопкой "Назад"
 * - Содержит router-outlet для дочерних компонентов (информация о вакансии)
 * - Управляет подписками для предотвращения утечек памяти
 *
 * Жизненный цикл:
 * - OnInit: подписывается на данные маршрута и извлекает объект вакансии
 * - OnDestroy: отписывается от всех активных подписок
 *
 * @property {Vacancy} vacancy - объект вакансии, полученный из резолвера
 * @property {Subscription[]} subscriptions$ - массив подписок для управления памятью
 *
 * @selector app-vacancies-detail
 * @standalone true - автономный компонент
 */
@Component({
  selector: "app-vacancies-detail",
  templateUrl: "./vacancies-detail.component.html",
  styleUrl: "./vacancies-detail.component.scss",
  imports: [CommonModule, BarComponent, RouterOutlet, BackComponent],
  providers: [VacancyDetailInfoService, VacancyDetailUIInfoService],
  standalone: true,
})
export class VacanciesDetailComponent implements OnInit, OnDestroy {
  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);

  protected readonly vacancy = this.vacancyDetailUIInfoService.vacancy;

  ngOnInit(): void {
    this.vacancyDetailInfoService.initializeDetailInfo();
  }

  ngOnDestroy(): void {
    this.vacancyDetailInfoService.destroy();
  }
}
