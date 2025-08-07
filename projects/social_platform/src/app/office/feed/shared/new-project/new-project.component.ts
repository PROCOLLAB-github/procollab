/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { Router, RouterLink } from "@angular/router";
import { FeedProject } from "@office/feed/models/feed-item.model";

/**
 * КОМПОНЕНТ НОВОГО ПРОЕКТА
 *
 * Отображает карточку нового проекта в ленте новостей.
 * Предоставляет краткую информацию о проекте и возможность перехода к детальной странице.
 *
 * ОСНОВНЫЕ ФУНКЦИИ:
 * - Отображение основной информации о проекте
 * - Показ изображения проекта
 * - Отображение краткого описания
 * - Показ количества просмотров
 * - Навигация к детальной странице проекта
 *
 * ОТОБРАЖАЕМАЯ ИНФОРМАЦИЯ:
 * - Название проекта
 * - Краткое описание
 * - Изображение проекта
 * - Количество просмотров
 * - Информация о руководителе (через AvatarComponent)
 *
 * ИСПОЛЬЗУЕМЫЕ КОМПОНЕНТЫ:
 * - ButtonComponent: кнопки действий
 * - AvatarComponent: аватар руководителя проекта
 * - RouterLink: навигация к детальной странице
 */
@Component({
  selector: "app-new-project",
  standalone: true,
  imports: [CommonModule, ButtonComponent, AvatarComponent, RouterLink],
  templateUrl: "./new-project.component.html",
  styleUrl: "./new-project.component.scss",
})
export class NewProjectComponent {
  /**
   * ВХОДНЫЕ ДАННЫЕ
   *
   * @Input feedItem - объект проекта для отображения
   *
   * СОДЕРЖИТ:
   * - id: уникальный идентификатор проекта
   * - name: название проекта
   * - shortDescription: краткое описание проекта
   * - industry: ID отрасли проекта
   * - imageAddress: URL изображения проекта
   * - viewsCount: количество просмотров проекта
   * - leader: ID руководителя проекта
   */
  @Input() feedItem!: FeedProject;

  /**
   * КОНСТРУКТОР
   *
   * ЧТО ПРИНИМАЕТ:
   * @param router - сервис маршрутизации Angular для программной навигации
   *
   * НАЗНАЧЕНИЕ:
   * Инициализирует компонент с доступом к сервису маршрутизации
   * для возможной навигации к детальной странице проекта
   */
  constructor(public readonly router: Router) {}
}
