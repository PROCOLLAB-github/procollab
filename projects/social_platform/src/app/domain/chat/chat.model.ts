/** @format */
import type { ChatMessage } from "projects/social_platform/src/app/domain/chat/chat-message.model";

/**
 * Класс для уведомления об изменении статуса пользователя
 */
export class OnChangeStatus {
  /** Идентификатор пользователя, изменившего статус */
  userId!: number;
}

/**
 * DTO для получения нового сообщения в чате
 */
export class OnChatMessageDto {
  /** Идентификатор чата */
  chatId!: string;
  /** Объект сообщения */
  message!: ChatMessage;
}

/**
 * DTO для отправки сообщения в чат
 */
export class SendChatMessageDto {
  /** Тип чата: "direct" - личный чат, "project" - чат проекта */
  chatType!: "direct" | "project";
  /** Идентификатор чата */
  chatId!: string;
  /** Текст сообщения */
  text!: string;
  /** Массив URL прикрепленных файлов */
  fileUrls!: string[];
  /** ID сообщения, на которое отвечаем (null если не ответ) */
  replyTo!: number | null;
}

/**
 * DTO для уведомления о редактировании сообщения
 */
export class OnEditChatMessageDto {
  /** Идентификатор чата */
  chatId!: string;
  /** Отредактированное сообщение */
  message!: ChatMessage;
}

/**
 * DTO для уведомления об удалении сообщения
 */
export class OnDeleteChatMessageDto {
  /** Тип чата */
  chatType!: "project" | "direct";
  /** Идентификатор чата */
  chatId!: string;
  /** Идентификатор удаленного сообщения */
  messageId!: number;
}

/**
 * DTO для уведомления о прочтении сообщения
 */
export class OnReadChatMessageDto {
  /** Тип чата */
  chatType!: "project" | "direct";
  /** Идентификатор чата */
  chatId!: string;
  /** Идентификатор прочитанного сообщения */
  messageId!: number;
  /** Идентификатор пользователя, прочитавшего сообщение */
  userId!: number;
}

/**
 * DTO для редактирования сообщения
 */
export class EditChatMessageDto {
  /** Тип чата */
  chatType!: "direct" | "project";
  /** Идентификатор чата */
  chatId!: string;
  /** Новый текст сообщения */
  text!: string;
  /** Идентификатор редактируемого сообщения */
  messageId!: number;
}

/**
 * DTO для удаления сообщения
 */
export class DeleteChatMessageDto {
  /** Тип чата */
  chatType!: "direct" | "project";
  /** Идентификатор чата */
  chatId!: string;
  /** Идентификатор удаляемого сообщения */
  messageId!: number;
}

/**
 * DTO для отметки сообщения как прочитанного
 */
export class ReadChatMessageDto {
  /** Тип чата */
  chatType!: "direct" | "project";
  /** Идентификатор чата */
  chatId!: string;
  /** Идентификатор сообщения для отметки */
  messageId!: number;
}

/**
 * DTO для уведомления о том, что пользователь печатает
 */
export class TypingInChatDto {
  /** Тип чата */
  chatType!: "direct" | "project";
  /** Идентификатор чата */
  chatId!: string;
}

/**
 * DTO для события "пользователь печатает"
 */
export class TypingInChatEventDto {
  /** Тип чата */
  chatType!: "direct" | "project";
  /** Идентификатор чата */
  chatId!: string;
  /** Идентификатор печатающего пользователя */
  userId!: number;
  /** Время окончания печатания (timestamp) */
  endTime!: number;
}

/**
 * Перечисление типов событий чата
 */
export enum ChatEventType {
  /** Новое сообщение */
  NEW_MESSAGE = "new_message",
  /** Редактирование сообщения */
  EDIT_MESSAGE = "edit_message",
  /** Удаление сообщения */
  DELETE_MESSAGE = "delete_message",
  /** Прочтение сообщения */
  READ_MESSAGE = "message_read",
  /** Пользователь печатает */
  TYPING = "user_typing",
  /** Пользователь онлайн */
  SET_ONLINE = "set_online",
  /** Пользователь оффлайн */
  SET_OFFLINE = "set_offline",
}
