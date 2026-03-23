/** @format */

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ChatWindowComponent } from "@ui/components/chat-window/chat-window.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { BackComponent } from "@uilib";
import { ChatDirectInfoService } from "projects/social_platform/src/app/api/chat/facedes/chat-direct-info.service";
import { ChatDirectUIInfoService } from "projects/social_platform/src/app/api/chat/facedes/ui/chat-direct-ui-info.service";

/**
 * Компонент для отображения конкретного прямого чата
 *
 * Функциональность:
 * - Отображение сообщений чата с пагинацией
 * - Отправка, редактирование и удаление сообщений
 * - Обработка событий WebSocket (новые сообщения, печатание, редактирование, удаление, прочтение)
 * - Индикация печатающих пользователей
 * - Прочтение сообщений
 *
 * @selector app-chat-direct
 * @templateUrl ./chat-direct.component.html
 * @styleUrl ./chat-direct.component.scss
 */
@Component({
  selector: "app-chat-direct",
  templateUrl: "./chat-direct.component.html",
  styleUrl: "./chat-direct.component.scss",
  imports: [RouterLink, AvatarComponent, ChatWindowComponent, BackComponent],
  providers: [ChatDirectInfoService, ChatDirectUIInfoService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatDirectComponent implements OnInit, OnDestroy {
  private readonly ChatDirectInfoService = inject(ChatDirectInfoService);
  private readonly ChatDirectUIInfoService = inject(ChatDirectUIInfoService);

  /**
   * Инициализация компонента
   * - Загружает данные чата из резолвера
   * - Загружает первую порцию сообщений
   * - Инициализирует обработчики WebSocket событий
   * - Получает ID текущего пользователя
   */
  ngOnInit(): void {
    this.ChatDirectInfoService.initializationChatDirect("direct");
  }

  /**
   * Очистка подписок при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.ChatDirectInfoService.destroy();
  }

  /** ID текущего пользователя */
  protected readonly currentUserId = this.ChatDirectUIInfoService.currentUserId;

  /** Список пользователей, которые сейчас печатают */
  protected readonly typingPersons = this.ChatDirectInfoService.typingPersons;

  /** Данные текущего чата */
  protected readonly chat = this.ChatDirectInfoService.chat;

  /** Массив сообщений чата */
  protected readonly messages = this.ChatDirectInfoService.messages;

  /** Флаг процесса загрузки сообщений */
  protected readonly fetching = this.ChatDirectUIInfoService.fetching;

  /**
   * Обработчик отправки нового сообщения
   * @param message - Объект сообщения с текстом, файлами и ответом
   */
  onSubmitMessage(message: any): void {
    this.ChatDirectInfoService.onSubmitMessage(message);
  }

  /**
   * Обработчик редактирования сообщения
   * @param message - Объект сообщения с новым текстом и ID
   */
  onEditMessage(message: any): void {
    this.ChatDirectInfoService.onEditMessage(message);
  }

  /**
   * Обработчик удаления сообщения
   * @param messageId - ID удаляемого сообщения
   */
  onDeleteMessage(messageId: number): void {
    this.ChatDirectInfoService.onDeleteMessage(messageId);
  }

  onFetchMessages(): void {
    this.ChatDirectInfoService.onFetchMessages();
  }

  /**
   * Обработчик события печатания
   * Отправляет уведомление о том, что пользователь печатает
   */
  onType() {
    this.ChatDirectInfoService.onType();
  }

  /**
   * Обработчик прочтения сообщения
   * @param messageId - ID прочитанного сообщения
   */
  onReadMessage(messageId: number) {
    this.ChatDirectInfoService.onReadMessage(messageId);
  }
}
