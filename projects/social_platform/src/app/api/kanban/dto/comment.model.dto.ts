/** @format */

import { User } from "projects/social_platform/src/app/domain/auth/user.model";

export interface CommentDto {
  id: number;
  text: string;
  files: FillMode[];
  author: User;
  createdAt: string;
}
