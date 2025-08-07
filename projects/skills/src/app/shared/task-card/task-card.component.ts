/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import type { Task, TasksResponse } from "../../../models/skill.model";

/**
 * Компонент карточки задачи
 *
 * Отображает информацию о задаче в виде карточки с деталями задачи и её статусом.
 * Используется для представления задач в списке или сетке задач.
 *
 * @example
 * <app-task-card
 *   [task]="taskData"
 *   [status]="taskStatus">
 * </app-task-card>
 */
@Component({
  selector: "app-task-card",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.scss",
})
export class TaskCardComponent {
  /**
   * Данные задачи для отображения
   *
   * Обязательное свойство, содержащее всю информацию о задаче:
   * название, описание, сложность и другие параметры.
   */
  @Input({ required: true }) task!: Task;

  /**
   * Статус выполнения задачи
   *
   * Обязательное свойство, содержащее информацию о статусе задачи
   * из статистики недель. Используется для отображения прогресса
   * и текущего состояния выполнения задачи.
   */
  @Input({ required: true }) status!: TasksResponse["statsOfWeeks"][0];
}
