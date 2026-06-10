/** @format */

import { User } from "@domain/auth/user.model";
import { ChatMessage } from "@domain/chat/chat-message.model";

/** Модели данных для элементов чата */
/** Интерфейс элемента чата в списке чатов */
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
  /** Флаг непрочитанного последнего сообщения (вычисляется в фасаде) */
  isUnread?: boolean;
}

/** Интерфейс детальной информации о чате */
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
