/**
 * id — ID курса (создается автоматически).
 *   title — название курса (до 45 символов).
 *   description — описание курса (до 600 символов, можно оставить пустым).
 *   access_type — тип доступа: для всех, для участников программы, по подписке.
 *   partner_program — связанная программа (может быть пустой, кроме сценария “для участников программы”).
 *   avatar_file — аватар курса (файл, необязательно).
 *   card_cover_file — обложка карточки курса в каталоге (файл, необязательно).
 *   header_cover_file — обложка шапки внутри страницы курса (файл, необязательно).
 *   start_date — дата старта курса (может быть пустой).
 *   end_date — дата окончания курса (может быть пустой).
 *   status — статус контента курса: черновик, опубликован, завершен.
 *   is_completed — логический флаг завершения курса.
 *   completed_at — дата/время завершения курса.
 *   datetime_created — дата/время создания.
 *   datetime_updated — дата/время обновления.
 *
 * @format
 */

import { Program } from "@office/program/models/program.model";

export interface Course {
  id: number;
  title: string;
  description: string;
  accessType: "all" | "participating" | "subs";
  partnerProgram: Program;
  avatarFile: string;
  cardCoverFile: string;
  headerCoveFile: string;
  startDate: Date;
  endDate: Date;
  status: "draft" | "published" | "ended";
  isCompleted: boolean;
  completedAt: Date;
  datetimeCreated: Date;
  datetimeUpdated: Date;
}

/**
  id — уникальный идентификатор модуля.
  course — курс, к которому относится модуль (обязательная связь).
  title — название модуля, максимум 40 символов.
  avatar_file — аватар модуля (необязательный файл).
  start_date — дата старта модуля (обязательная).
  status — статус модуля: draft (черновик), published (опубликован)
  order — порядковый номер модуля внутри курса (по нему сортируется вывод).
  datetime_created — дата/время создания.
  datetime_updated — дата/время последнего обновления.
 *
 */

export interface CourseModule {
  id: number;
  course: Course;
  title: string;
  avatarFile: string;
  startDate: Date;
  status: "draft" | "published";
  order: number;
  datetimeCreated: Date;
  datetimeUpdated: Date;
}

/**
  id — уникальный идентификатор урока.
  module — модуль, к которому относится урок (обязательная связь).
  title — название урока, максимум 45 символов.
  status — статус урока: draft (черновик), published (опубликован)
  order — порядковый номер урока внутри модуля.
  datetime_created — дата/время создания.
  datetime_updated — дата/время последнего обновления.
 */

export interface CourseLesson {
  id: number;
  module: CourseModule;
  title: string;
  status: "draft" | "published";
  order: number;
  datetimeCreated: Date;
  datetimeUpdated: Date;
}
