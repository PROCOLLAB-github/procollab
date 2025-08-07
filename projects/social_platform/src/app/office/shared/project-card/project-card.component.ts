/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Project } from "@models/project.model";
import { IndustryService } from "@services/industry.service";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { AsyncPipe, CommonModule } from "@angular/common";

/**
 * Компонент карточки проекта
 *
 * Функциональность:
 * - Отображает основную информацию о проекте (название, описание, участники)
 * - Показывает аватары участников проекта
 * - Отображает информацию об отрасли проекта через IndustryService
 * - Предоставляет кнопку удаления проекта (корзина) при наличии прав
 * - Поддерживает индикацию подписки на проект
 * - Проверяет права доступа на основе ID профиля пользователя
 *
 * Входные параметры:
 * @Input project - объект проекта (обязательный)
 * @Input canDelete - флаг возможности удаления проекта (по умолчанию false)
 * @Input isSubscribed - флаг подписки на проект (по умолчанию false)
 * @Input profileId - ID профиля текущего пользователя
 *
 * Выходные события:
 * @Output remove - событие удаления проекта, передает ID проекта
 *
 * Внутренние свойства:
 * - industryService - сервис для работы с отраслями (публичный для использования в шаблоне)
 */
@Component({
  selector: "app-project-card",
  templateUrl: "./project-card.component.html",
  styleUrl: "./project-card.component.scss",
  standalone: true,
  imports: [CommonModule, AvatarComponent, IconComponent, AsyncPipe],
})
export class ProjectCardComponent implements OnInit {
  constructor(public industryService: IndustryService) {}

  ngOnInit(): void {}

  @Input({ required: true }) project!: Project;
  @Input() canDelete?: boolean | null = false;
  @Input() isSubscribed?: boolean | null = false;
  @Input() profileId?: number;

  @Output() remove = new EventEmitter<number>();

  /**
   * Обработчик удаления проекта (клик по корзине)
   * Предотвращает всплытие события и эмитит событие удаления
   */
  onBasket(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.remove.emit(this.project.id);
  }
}
