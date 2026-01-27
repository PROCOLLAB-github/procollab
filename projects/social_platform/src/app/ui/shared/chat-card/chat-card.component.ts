/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { map } from "rxjs";
import { DayjsPipe } from "projects/core";
import { AsyncPipe } from "@angular/common";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { AuthService } from "../../../api/auth";
import { ChatListItem } from "../../../domain/chat/chat-item.model";

/**
 * Компонент карточки чата для отображения в списке чатов
 *
 * Отображает:
 * - Аватар чата/собеседника
 * - Название чата
 * - Последнее сообщение с аватаром автора
 * - Дату последнего сообщения
 * - Индикатор непрочитанных сообщений
 *
 * @selector app-chat-card
 * @templateUrl ./chat-card.component.html
 * @styleUrl ./chat-card.component.scss
 */
@Component({
  selector: "app-chat-card",
  templateUrl: "./chat-card.component.html",
  styleUrl: "./chat-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, AsyncPipe, DayjsPipe],
})
export class ChatCardComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  /** Данные чата для отображения */
  @Input({ required: true }) chat!: ChatListItem;

  /** Флаг последнего элемента в списке (для стилизации) */
  @Input() isLast = false;

  /**
   * Observable для определения непрочитанного сообщения
   * Сообщение считается непрочитанным если:
   * - Автор не текущий пользователь
   * - Сообщение помечено как непрочитанное
   */
  public unread = this.authService.profile.pipe(
    map(p => p.id !== this.chat.lastMessage.author.id && !this.chat.lastMessage.isRead)
  );

  ngOnInit(): void {}
}
