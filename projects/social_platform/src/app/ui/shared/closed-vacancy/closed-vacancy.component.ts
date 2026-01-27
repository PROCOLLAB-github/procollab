/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { DayjsPipe } from "projects/core";
import { Router, RouterLink } from "@angular/router";

/**
 * КОМПОНЕНТ ЗАКРЫТОЙ ВАКАНСИИ
 *
 * Отображает карточку закрытой (неактивной) вакансии в ленте новостей.
 * Предоставляет ограниченную информацию о вакансии и указывает на её статус.
 *
 * ОСНОВНЫЕ ФУНКЦИИ:
 * - Отображение основной информации о закрытой вакансии
 * - Показ статуса "закрыто" или "неактивно"
 * - Навигация к детальной странице вакансии (если доступна)
 * - Форматирование дат с помощью DayjsPipe
 *
 * ИСПОЛЬЗУЕМЫЕ КОМПОНЕНТЫ:
 * - ButtonComponent: кнопки действий
 * - TagComponent: теги и метки
 * - DayjsPipe: форматирование дат
 * - RouterLink: навигация между страницами
 *
 * ОТЛИЧИЯ ОТ ОТКРЫТОЙ ВАКАНСИИ:
 * - Ограниченный функционал
 * - Визуальные индикаторы закрытого статуса
 * - Отсутствие кнопок подачи заявки
 */
@Component({
  selector: "app-closed-vacancy",
  standalone: true,
  imports: [CommonModule, ButtonComponent, DayjsPipe, RouterLink],
  templateUrl: "./closed-vacancy.component.html",
  styleUrl: "./closed-vacancy.component.scss",
})
export class ClosedVacancyComponent {
  /**
   * КОНСТРУКТОР
   *
   * ЧТО ПРИНИМАЕТ:
   * @param router - сервис маршрутизации Angular для программной навигации
   *
   * НАЗНАЧЕНИЕ:
   * Инициализирует компонент с доступом к сервису маршрутизации
   * для возможной навигации к детальной странице вакансии
   */
  constructor(public readonly router: Router) {}
}
