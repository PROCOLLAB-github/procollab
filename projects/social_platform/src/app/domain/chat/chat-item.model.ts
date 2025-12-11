/** @format */

import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { ChatMessage } from "projects/social_platform/src/app/domain/chat/chat-message.model";

/**
 * Модели данных для элементов чата
 *
 * Содержит интерфейсы для представления чатов в списке и детальной информации
 */
/**
 * Интерфейс для элемента чата в списке чатов
 * Используется для отображения превью чата с последним сообщением
 */
export interface ChatListItem {
  /** Уникальный идентификатор чата */
  id: string;

  /** Информация о последнем сообщении в чате */
  lastMessage: {
    /** Автор последнего сообщения */
    author: User;
    /** Флаг удаленного сообщения */
    isDeleted: boolean;
    /** Флаг отредактированного сообщения */
    isEdited: boolean;
    /** Флаг прочитанного сообщения */
    isRead: boolean;
    /** Ссылка на сообщение, на которое отвечают */
    replyTo: ChatMessage | null;
    /** Текст сообщения */
    text: string;
    /** Дата создания сообщения */
    createdAt: string;
  };

  /** Название чата */
  name: string;
  /** URL изображения чата */
  imageAddress: string;
  /** Собеседник (для прямых чатов) */
  opponent?: User;
}

/**
 * Интерфейс для детальной информации о чате
 * Используется при открытии конкретного чата
 */
export interface ChatItem {
  /** Уникальный идентификатор чата */
  id: string;
  /** URL изображения чата */
  imageAddress: string;
  /** Название чата */
  name: string;
  /** Информация о собеседнике */
  opponent: User;
}
