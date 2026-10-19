/** @format */

/** Модель уведомления пользователя */
export class Notification {
  id!: number;
  text!: string;
  readAt!: string | null;
  programId!: number;
  createdAt!: string;
}
