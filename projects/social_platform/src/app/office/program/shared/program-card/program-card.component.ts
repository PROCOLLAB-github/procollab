/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { DatePipe } from "@angular/common";

/**
 * Компонент карточки программы
 *
 * Отображает краткую информацию о программе в виде карточки для списков.
 * Используется на главной странице программ и в других местах, где нужно
 * показать превью программы.
 *
 * Принимает:
 * @Input program?: Program - Объект программы для отображения
 *
 * Отображает:
 * - Изображение программы (аватар)
 * - Название программы
 * - Краткое описание
 * - Даты проведения (отформатированные)
 * - Иконки и дополнительную информацию
 *
 * Использует:
 * - AvatarComponent для отображения изображения
 * - IconComponent для иконок
 * - DatePipe как альтернативный форматтер дат
 *
 * Возвращает:
 * HTML шаблон карточки программы с базовой информацией
 */
@Component({
  selector: "app-program-card",
  templateUrl: "./program-card.component.html",
  styleUrl: "./program-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, IconComponent, DatePipe],
})
export class ProgramCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) program?: Program;

  ngOnInit(): void {}
}
