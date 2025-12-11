/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { DatePipe, NgClass } from "@angular/common";
import { Program } from "../../../domain/program/program.model";

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
  imports: [AvatarComponent, IconComponent, DatePipe, NgClass],
})
export class ProgramCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) program?: Program;

  ngOnInit(): void {
    this.registerDateExpired = Date.now() > Date.parse(this.program!.datetimeRegistrationEnds);
  }

  registerDateExpired?: boolean;
}
