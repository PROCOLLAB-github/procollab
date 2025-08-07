/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Vacancy } from "@models/vacancy.model";
import { IconComponent } from "@ui/components";

/**
 * Компонент карточки вакансии
 *
 * Функциональность:
 * - Отображает информацию о вакансии (название, описание, требуемые навыки)
 * - Формирует строку навыков из массива требуемых навыков
 * - Предоставляет кнопки для редактирования и удаления вакансии
 * - Предотвращает всплытие событий при клике на кнопки действий
 * - Отображает данные в JSON формате для отладки
 *
 * Входные параметры:
 * @Input vacancy - объект вакансии (опциональный)
 *
 * Выходные события:
 * @Output remove - событие удаления вакансии, передает ID вакансии
 * @Output edit - событие редактирования вакансии, передает ID вакансии
 *
 * Внутренние свойства:
 * - skillString - строка с перечислением требуемых навыков через разделитель
 */
@Component({
  selector: "app-vacancy-card",
  templateUrl: "./vacancy-card.component.html",
  styleUrl: "./vacancy-card.component.scss",
  standalone: true,
  imports: [IconComponent],
})
export class VacancyCardComponent implements OnInit {
  constructor() {}

  @Input() vacancy?: Vacancy;
  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  skillString = "";

  ngOnInit(): void {
    // Формирование строки навыков с разделителем
    this.skillString = this.vacancy?.requiredSkills.map(s => s.name).join(" • ") ?? "";
  }

  /**
   * Обработчик удаления вакансии
   * Предотвращает всплытие события и эмитит событие удаления
   */
  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.vacancy?.id);
  }

  /**
   * Обработчик редактирования вакансии
   * Предотвращает всплытие события и эмитит событие редактирования
   */
  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.edit.emit(this.vacancy?.id);
  }
}
