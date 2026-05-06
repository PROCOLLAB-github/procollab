/** @format */

import { User } from "@domain/auth/user.model";

export interface CommentDto {
  id: number;
  text: string;
  files: FillMode[];
  author: User;
  createdAt: string;
}
