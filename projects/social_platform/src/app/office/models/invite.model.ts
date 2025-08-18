/** @format */

import { User } from "@auth/models/user.model";
import { Project } from "./project.model";

/**
 * Модель приглашения в проект
 * Представляет приглашение пользователя для участия в проекте
 *
 * Содержит:
 * - Информацию о проекте и роли
 * - Статус принятия приглашения
 * - Мотивационное письмо и специализацию
 * - Данные пользователя-отправителя
 */
export class Invite {
  id!: number;
  datetimeCreated!: string;
  datetimeUpdated!: string;
  isAccepted?: boolean;
  motivationalLetter?: string;
  project!: Project;
  role!: string;
  specialization?: string;

  user!: User;
}
