/** @format */

export interface SendForUserCommand {
  userId: number;
  projectId: number;
  role: string;
  specialization?: string;
}
