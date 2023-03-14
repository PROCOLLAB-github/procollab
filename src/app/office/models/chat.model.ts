/** @format */
import { ChatMessage } from "@models/chat-message.model";

export class LoadChatMessages {
  count!: number;
  next!: string;
  previous!: string;
  results!: ChatMessage[];
}
export class SendChatMessageDto {
  chatType!: "direct" | "project";
  chatId!: string;
  message!: string;
  replyTo!: number | null;
}

export class EditChatMessageDto {
  chatType!: "direct" | "project";
  chatId!: string;
  message!: string;
  messageId!: number;
}

export class DeleteChatMessageDto {
  chatType!: "direct" | "project";
  chatId!: string;
  messageId!: number;
}

export class ReadChatMessageDto {
  chatType!: "direct" | "project";
  chatId!: string;
  messageId!: number;
}

export class TypingInChatDto {
  chatType!: "direct" | "project";
  chatId!: string;
}

export class TypingInChatEventDto {
  chatType!: "direct" | "project";
  chatId!: string;
  userId!: number;
  endTime!: number;
}

export enum ChatEventType {
  NEW_MESSAGE = "new_message",
  EDIT_MESSAGE = "edit_message",
  DELETE_MESSAGE = "delete_message",
  READ_MESSAGE = "message_read",
  TYPING = "user_typing",

  SET_ONLINE = "set_online",
  SET_OFFLINE = "set_offline",
}
