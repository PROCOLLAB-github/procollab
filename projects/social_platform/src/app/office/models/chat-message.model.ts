/** @format */

import { User } from "@auth/models/user.model";
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

  static default(): ChatMessage {
    return {
      author: User.default(),
      createdAt: dayjs().format("YYYY-MM-DD hh:mm:ss"),
      isEdited: false,
      isDeleted: false,
      isRead: true,
      replyTo: null,
      files: [
        {
          name: "some name",
          extension: "pdf",
          size: 10000,
          user: 12,
          link: "sdfsdf",
          datetimeUploaded: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
      ],
      text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt dolor excepturi iste, sunt suscipit voluptates? A ad aliquid aspernatur, at delectus dolore dolores doloribus eligendi fuga fugit incidunt, magni possimus quasi quod sapiente sint sunt? A amet beatae doloribus dolorum est iure, maxime obcaecati perspiciatis vero. Fugit molestiae neque, omnis provident sed temporibus vel? Accusamus aliquam, amet asperiores cupiditate enim exercitationem harum hic impedit in ipsa magnam minus molestiae necessitatibus neque nisi nulla numquam optio pariatur quaerat quam, quis quisquam rem saepe sapiente sunt totam voluptate. Autem, inventore, placeat! Aperiam cumque dolor eaque minus neque quasi quis repellat. Adipisci asperiores cumque illum, in libero magni nihil quod. Beatae blanditiis distinctio expedita illo iusto libero maxime neque odio odit provident, quis totam velit voluptate. Assumenda, deleniti ex fugiat in, non perferendis perspiciatis possimus praesentium quas quasi quis quos repellendus repudiandae sequi sunt tenetur veritatis? Alias architecto dolores expedita sequi voluptatibus? A alias aperiam asperiores atque distinctio, error eum eveniet ipsam laudantium nobis omnis perferendis perspiciatis possimus quasi quia repudiandae sit unde velit? Alias enim est ipsa vel voluptatem? Accusamus commodi delectus est minus molestias natus, reprehenderit rerum sit voluptas voluptatem! A ad minima neque nulla officiis quia quisquam repellat repudiandae, sunt!",
      id: 1,
    };
  }
}
