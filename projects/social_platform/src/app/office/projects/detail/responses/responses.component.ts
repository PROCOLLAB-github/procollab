/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, Subscription } from "rxjs";
import { VacancyResponse } from "@models/vacancy-response.model";
import { VacancyService } from "@services/vacancy.service";
import { NavService } from "@services/nav.service";
import { ResponseCardComponent } from "@office/shared/response-card/response-card.component";

/**
 * Компонент для отображения откликов на вакансии проекта
 *
 * Функциональность:
 * - Отображение списка откликов на вакансии проекта
 * - Принятие и отклонение откликов
 * - Фильтрация откликов (показывает только неодобренные)
 *
 * Принимает:
 * - Список откликов через резолвер
 * - ID проекта из параметров маршрута
 *
 * Предоставляет:
 * - responses - отфильтрованный список откликов
 * - Методы для принятия и отклонения откликов
 */
@Component({
  selector: "app-responses",
  templateUrl: "./responses.component.html",
  styleUrl: "./responses.component.scss",
  standalone: true,
  imports: [ResponseCardComponent],
})
export class ProjectResponsesComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly vacancyService: VacancyService,
    private readonly navService: NavService
  ) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль проекта");

    // Загрузка и фильтрация откликов (только неодобренные)
    this.responses$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((responses: VacancyResponse[]) => {
        this.responses = responses.filter(response => response.isApproved === null);
      });
  }

  ngOnDestroy(): void {
    this.responses$?.unsubscribe();
  }

  /** Observable с ID проекта из параметров маршрута */
  projectId: Observable<number> = this.route.params.pipe(
    map(r => r["projectId"]),
    map(Number)
  );

  /** Подписка на данные откликов */
  responses$?: Subscription;

  /** Список откликов для отображения */
  responses: VacancyResponse[] = [];

  /**
   * Принятие отклика на вакансию
   * @param responseId - ID отклика для принятия
   */
  acceptResponse(responseId: number) {
    this.vacancyService.acceptResponse(responseId).subscribe(() => {
      const index = this.responses.findIndex(el => el.id === responseId);
      this.responses.splice(index, 1);
    });
  }

  /**
   * Отклонение отклика на вакансию
   * @param responseId - ID отклика для отклонения
   */
  rejectResponse(responseId: number) {
    this.vacancyService.rejectResponse(responseId).subscribe(() => {
      const index = this.responses.findIndex(el => el.id === responseId);
      this.responses.splice(index, 1);
    });
  }
}
