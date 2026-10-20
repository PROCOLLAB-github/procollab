/** @format */

/** Модель уведомления пользователя */
export class Notification {
  id!: string;
  kind!: "expert_joined" | "registration_connection";
  text!: string;
  readAt!: string | null;
  programId!: number;
  registrationId?: number;
  createdAt!: string;
}
