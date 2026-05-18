/** @format */

import { User } from "@domain/auth/user.model";
import * as dayjs from "dayjs";

/**
 * Модели для системы чатов
 *
 * ChatFile - представляет файл, прикрепленный к сообщению
 * ChatMessage - модель сообщения в чате
 *
 * Содержат:
 * - Информацию об авторе и времени создания
 * - Текст сообщения и прикрепленные файлы
 * - Статусы прочтения, редактирования и удаления
 * - Ссылки на сообщения для ответов
 */
export class ChatFile {
  name!: string;
  // TODO: switch to mimetype when back will be ready
  extension!: string;
  size!: number;
  link!: string;
  user!: number;
  datetimeUploaded!: string;
}
export class ChatMessage {
  id!: number;
  author!: User;
  isEdited!: boolean;
  isRead!: boolean;
  isDeleted!: boolean;
  // eslint-disable-next-line no-use-before-define
  replyTo!: ChatMessage | null;
  text!: string;
  createdAt!: string;
  files!: ChatFile[];
}
