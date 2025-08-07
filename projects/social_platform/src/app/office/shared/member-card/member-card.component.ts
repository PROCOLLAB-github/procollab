/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "@auth/models/user.model";
import { YearsFromBirthdayPipe } from "projects/core";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AsyncPipe } from "@angular/common";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";

/**
 * Компонент карточки участника команды
 *
 * Функциональность:
 * - Отображает основную информацию об участнике (аватар, имя, возраст)
 * - Показывает роль пользователя через UserRolePipe
 * - Вычисляет возраст на основе даты рождения через YearsFromBirthdayPipe
 * - Отображает теги с дополнительной информацией
 * - Простой компонент для отображения без интерактивности
 *
 * Входные параметры:
 * @Input user - объект пользователя (обязательный)
 *
 * Выходные события: отсутствуют
 *
 * Используемые пайпы:
 * - YearsFromBirthdayPipe - вычисление возраста по дате рождения
 * - UserRolePipe - форматирование роли пользователя
 * - AsyncPipe - работа с асинхронными данными
 *
 * Примечание: Компонент предназначен только для отображения информации
 */
@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrl: "./member-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, TagComponent, AsyncPipe, UserRolePipe, YearsFromBirthdayPipe],
})
export class MemberCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) user!: User;

  ngOnInit(): void {}
}
