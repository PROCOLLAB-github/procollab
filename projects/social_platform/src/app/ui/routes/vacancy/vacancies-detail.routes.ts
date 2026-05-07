/** @format */

import { VacancyInfoComponent } from "../../pages/vacancies/detail/info/info.component";
import { VacanciesDetailComponent } from "../../pages/vacancies/detail/vacancies-detail.component";
import { VacanciesDetailResolver } from "../../pages/vacancies/detail/vacancies-detail.resolver";

/**
 * Конфигурация маршрутов для детального просмотра вакансии
 *
 * Структура маршрутов:
 * - '' (корневой) - основной компонент детального просмотра
 *   - resolve.data - предварительная загрузка данных вакансии через VacanciesDetailResolver
 *   - children - дочерние маршруты:
 *     * '' - компонент с информацией о вакансии (VacancyInfoComponent)
 *
 * Использование резолвера:
 * - VacanciesDetailResolver загружает данные вакансии перед отображением компонента
 * - Данные доступны в компоненте через this.route.data['data']
 *
 * @returns {Routes} Массив конфигурации маршрутов для детального просмотра
 */
export const VACANCIES_DETAIL_ROUTES = [
  {
    path: "",
    component: VacanciesDetailComponent,
    resolve: {
      data: VacanciesDetailResolver,
    },
    children: [
      {
        path: "",
        component: VacancyInfoComponent,
      },
    ],
  },
];
