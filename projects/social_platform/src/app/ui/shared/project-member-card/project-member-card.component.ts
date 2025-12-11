/** @format */

import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from "@angular/cdk/menu";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { AvatarComponent, IconComponent } from "@uilib";

/**
 * КОМПОНЕНТ КАРТОЧКИ УЧАСТНИКА ПРОЕКТА
 *
 * Этот компонент отображает информацию об участнике проекта в виде карточки
 * с возможностью управления (для лидера проекта).
 *
 * НАЗНАЧЕНИЕ:
 * - Отображение информации об участнике (аватар, имя, роль)
 * - Предоставление функций управления командой для лидера
 * - Индикация статуса лидера проекта
 *
 * @params
 * - member: Collaborator - объект с данными участника (обязательный)
 * - isLeader: boolean - флаг, является ли участник лидером (по умолчанию false)
 * - manageRights: boolean - флаг наличия прав управления у текущего пользователя (по умолчанию false)
 *
 * @returns
 * - remove: EventEmitter<Collaborator["userId"]> - событие удаления участника из команды
 * - transferOwnership: EventEmitter<Collaborator["userId"]> - событие передачи лидерства участнику
 *
 * ФУНКЦИОНАЛЬНОСТЬ:
 * - Отображение аватара, имени и роли участника
 * - Ссылка на профиль участника
 * - Контекстное меню с действиями (для пользователей с правами управления)
 * - Индикация лидера проекта звездочкой
 *
 * @returns
 * - HTML-разметка карточки участника
 * - События для управления командой
 */
@Component({
  selector: "app-project-member-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    AvatarComponent,
    CdkMenuTrigger, // Директива для триггера контекстного меню
    CdkMenuItem, // Директива для элементов меню
    CdkMenu, // Директива для контейнера меню
  ],
  templateUrl: "./project-member-card.component.html",
  styleUrl: "./project-member-card.component.scss",
})
export class ProjectMemberCardComponent {
  @Input({ required: true }) member!: Collaborator; // Данные участника (обязательное поле)
  @Input() isLeader = false; // Флаг лидера проекта
  @Input() manageRights = false; // Флаг прав управления

  @Output() remove = new EventEmitter<Collaborator["userId"]>(); // Событие удаления участника
  @Output() transferOwnership = new EventEmitter<Collaborator["userId"]>(); // Событие передачи лидерства
}
