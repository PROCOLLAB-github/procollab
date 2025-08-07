/** @format */

import { User } from "@auth/models/user.model";
import { FileModel } from "./file.model";

/**
 * Модель отклика на вакансию
 * Представляет ответ пользователя на размещенную вакансию в проекте
 *
 * Содержит:
 * - Информацию о пользователе, откликнувшемся на вакансию
 * - Мотивационное письмо и сопроводительные файлы
 * - Статус одобрения отклика
 */
export class VacancyResponse {
  id!: number;
  whyMe!: string;
  isApproved?: boolean;
  user!: User;
  vacancy!: number;
  accompanyingFile!: FileModel;
}
