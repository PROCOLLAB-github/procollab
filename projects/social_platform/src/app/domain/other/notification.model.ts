/** @format */

/** Модель уведомления пользователя */
export class Notification {
  id!: string;
  kind!: "expert_joined" | "registration_connection" | "program_attention";
  category?:
    "participants-without-visit" | "participants-without-team" | "projects-awaiting-evaluation";
  text!: string;
  readAt!: string | null;
  programId!: number;
  registrationId?: number;
  createdAt!: string;
}
