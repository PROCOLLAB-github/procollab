/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BarComponent } from "@ui/components";
import { RouterOutlet } from "@angular/router";

/**
 * Основной компонент модуля вакансий
 *
 * Функциональность:
 * - Отображает навигационную панель с двумя вкладками: "Вакансии" и "Мои отклики"
 * - Содержит router-outlet для отображения дочерних компонентов
 * - Служит контейнером для всех страниц модуля вакансий
 *
 * Используемые компоненты:
 * - BarComponent - навигационная панель с кнопкой "Назад" и ссылками
 * - RouterOutlet - для отображения дочерних маршрутов
 *
 * @selector app-vacancies
 * @standalone true - автономный компонент
 */
@Component({
  selector: "app-vacancies",
  standalone: true,
  imports: [CommonModule, BarComponent, RouterOutlet],
  templateUrl: "./vacancies.component.html",
  styleUrl: "./vacancies.component.scss",
})
export class VacanciesComponent {}
