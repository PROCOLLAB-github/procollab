/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../shared/circle-progress-bar/circle-progress-bar.component";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { ActivatedRoute, Router } from "@angular/router";
import { map, type Observable } from "rxjs";
import type { TaskResults } from "../../../models/skill.model";

/**
 * Компонент завершения задачи
 * Отображает результаты выполнения задачи: прогресс, статистику, баллы
 *
 * Функциональность:
 * - Показывает круговую диаграмму прогресса
 * - Отображает количество правильных ответов
 * - Показывает заработанные баллы
 * - Предоставляет навигацию к следующему заданию или в меню навыков
 */
@Component({
  selector: "app-complete",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent, IconComponent, ButtonComponent],
  templateUrl: "./complete.component.html",
  styleUrl: "./complete.component.scss",
})
export class TaskCompleteComponent {
  route = inject(ActivatedRoute); // Сервис для работы с активным маршрутом
  router = inject(Router); // Сервис для навигации

  // Получаем результаты задачи из данных маршрута
  results = this.route.data.pipe(map(r => r["data"])) as Observable<TaskResults>;
}
