/** @format */

import { Routes } from "@angular/router";
import { VacanciesListComponent } from "@ui/pages/vacancies/list/list.component";
import { VacanciesMyResolver } from "@ui/pages/vacancies/list/my.resolver";

/**
 * Конфигурация маршрутов для страницы "Мои отклики"
 *
 * Структура:
 * - '' (корневой маршрут) - отображает компонент VacanciesListComponent
 * - resolve.data - предварительная загрузка откликов через VacanciesMyResolver
 *
 * Особенности:
 * - Используется тот же компонент VacanciesListComponent, что и для всех вакансий
 * - Компонент определяет тип отображения по URL и показывает соответствующий контент
 * - Резолвер загружает данные откликов пользователя перед инициализацией компонента
 *
 * @returns {Routes} Массив конфигурации маршрутов для страницы откликов
 */
export const VACANCY_LIST_ROUTES: Routes = [
  {
    path: "",
    component: VacanciesListComponent,
    resolve: {
      data: VacanciesMyResolver,
    },
  },
];
