/** @format */

import { User } from "@auth/models/user.model";
import { ChatMessage } from "@models/chat-message.model";

export interface ChatListItem {
  id: string;
  lastMessage: {
    author: User;
    isDeleted: boolean;
    isEdited: boolean;
    isRead: boolean;
    replyTo: ChatMessage | null;
    text: string;
    createdAt: string;
  };
  name: string;
  imageAddress: string;
  opponent?: User;
}

export interface ChatItem {
  id: string;
  imageAddress: string;
  name: string;
  opponent: User;
}
