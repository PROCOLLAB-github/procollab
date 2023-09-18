/** @format */

import { User } from "@auth/models/user.model";

export interface ChatListItem {
  id: string;
  lastMessage: {
    author: User;
    isDeleted: boolean;
    isEdited: boolean;
    isRead: boolean;
    reply: ChatListItem["lastMessage"];
    text: string;
  };
  opponent: User;
}

export interface ChatItem {
  id: string;
  imageAddress: string;
  name: string;
  opponent: User;
}
