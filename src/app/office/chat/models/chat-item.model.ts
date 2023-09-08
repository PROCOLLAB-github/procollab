/** @format */

import { User } from "@auth/models/user.model";

export interface ChatItem {
  id: string;
  lastMessage: {
    author: User;
    isDeleted: boolean;
    isEdited: boolean;
    isRead: boolean;
    reply: ChatItem["lastMessage"];
    text: string;
  };
  users: User[];
}
