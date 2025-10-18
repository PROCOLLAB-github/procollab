/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { Vacancy } from "@office/models/vacancy.model";
import { BarComponent } from "@ui/components";
import { map, Subscription } from "rxjs";
import { BackComponent } from "@uilib";

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
  standalone: true,
  imports: [CommonModule, BarComponent, RouterOutlet, BackComponent],
  templateUrl: "./vacancies-detail.component.html",
  styleUrl: "./vacancies-detail.component.scss",
})
export class VacanciesDetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);

  subscriptions$: Subscription[] = [];

  vacancy?: Vacancy;

  ngOnInit(): void {
    const vacancySub$ = this.route.data.pipe(map(r => r["data"])).subscribe(vacancy => {
      this.vacancy = vacancy;
    });

    vacancySub$ && this.subscriptions$.push(vacancySub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
