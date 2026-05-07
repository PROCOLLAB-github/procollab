/** @format */

import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DayjsPipe } from "@corelib";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ChatListItem } from "@domain/chat/chat-item.model";

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
  imports: [AvatarComponent, DayjsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatCardComponent {
  /** Данные чата для отображения */
  @Input({ required: true }) chat!: ChatListItem;

  /** Флаг последнего элемента в списке (для стилизации) */
  @Input() isLast = false;

  /** Флаг непрочитанного сообщения — передаётся из фасада через родительский компонент */
  @Input() isUnread = false;
}
