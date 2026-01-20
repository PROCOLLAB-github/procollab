/** @format */

import { Injectable, signal } from "@angular/core";
import { ChatWindowComponent } from "@ui/components/chat-window/chat-window.component";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { ChatItem } from "projects/social_platform/src/app/domain/chat/chat-item.model";
import {
  ChatFile,
  ChatMessage,
} from "projects/social_platform/src/app/domain/chat/chat-message.model";
import {
  OnChatMessageDto,
  OnDeleteChatMessageDto,
  OnEditChatMessageDto,
  OnReadChatMessageDto,
} from "projects/social_platform/src/app/domain/chat/chat.model";

@Injectable()
export class ChatDirectUIInfoService {
  /** Список пользователей, которые сейчас печатают */
  readonly typingPersons = signal<ChatWindowComponent["typingPersons"]>([]);
  private readonly typingTimeouts = new Set<number>();

  /** Данные текущего чата */
  readonly chat = signal<ChatItem | undefined>(undefined);

  /** Массив сообщений чата */
  readonly messages = signal<ChatMessage[]>([]);

  /** Все файлы, загруженные в чат */
  readonly chatFiles = signal<ChatFile[]>([]);

  /** ID текущего пользователя */
  readonly currentUserId = signal<number | undefined>(undefined);

  /** Флаг процесса загрузки сообщений */
  readonly fetching = signal<boolean>(false);

  /**
   * Количество сообщений, загружаемых за один запрос
   */
  readonly messagesPerFetch = 20;

  /**
   * Общее количество сообщений в чате (приходит с сервера)
   */
  readonly messagesTotalCount = signal<number>(0);

  readMessagesEvent(result: OnReadChatMessageDto): void {
    this.messages.update(list =>
      list.map(m => (m.id === result.messageId ? { ...m, isRead: true } : m))
    );
  }

  deleteMessagesEvent(result: OnDeleteChatMessageDto): void {
    this.messages.update(list => list.filter(m => m.id !== result.messageId));
  }

  editMessahesEvent(result: OnEditChatMessageDto): void {
    this.messages.update(list => list.map(m => (m.id === result.message.id ? result.message : m)));
  }

  applyTypingEvent(): void {
    if (!this.chat()?.opponent) return;

    const userId = this.chat()!.opponent.id;

    this.typingPersons.update(list => [
      ...list,
      {
        firstName: this.chat()!.opponent.firstName,
        lastName: this.chat()!.opponent.lastName,
        userId,
      },
    ]);

    const timeoutId = window.setTimeout(() => {
      this.typingPersons.update(list => list.filter(p => p.userId !== userId));
      this.typingTimeouts.delete(timeoutId);
    }, 2000);

    this.typingTimeouts.add(timeoutId);
  }

  applyMessageEvent(result: OnChatMessageDto): void {
    this.messages.update(() => [...this.messages(), result.message]);
  }

  applyInitMessagesEvent(messages: ApiPagination<ChatMessage>): void {
    // Добавляем новые сообщения в начало массива (реверсируем порядок с сервера)
    this.messages.update(() => messages.results.reverse().concat(this.messages()));
    this.messagesTotalCount.set(messages.count);
  }

  clearTypingTimeouts(): void {
    this.typingTimeouts.forEach(id => clearTimeout(id));
    this.typingTimeouts.clear();
  }
}
