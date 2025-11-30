/** @format */

import { User } from "@auth/models/user.model";

export interface CommentDto {
  id: number;
  text: string;
  files: FillMode[];
  author: User;
  createdAt: string;
}
