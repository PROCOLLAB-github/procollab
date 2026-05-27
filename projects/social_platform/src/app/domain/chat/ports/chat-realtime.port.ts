/** @format */

import { Observable } from "rxjs";
import {
  DeleteChatMessageDto,
  EditChatMessageDto,
  OnChatMessageDto,
  OnDeleteChatMessageDto,
  OnEditChatMessageDto,
  OnReadChatMessageDto,
  OnChangeStatus,
  ReadChatMessageDto,
  SendChatMessageDto,
  TypingInChatDto,
  TypingInChatEventDto,
} from "../chat.model";

/**
 * Порт real-time операций чата (WebSocket).
 * Commands: sendMessage, editMessage, deleteMessage, readMessage, startTyping
 * Events: onMessage, onEdit, onDelete, onRead, onTyping, onSetOnline/Offline
 */
export abstract class ChatRealtimePort {
  /** Установить WebSocket соединение */
  abstract connect(): Observable<void>;

  // === Commands (отправка действий) ===
  abstract sendMessage(message: SendChatMessageDto): void;
  abstract editMessage(message: EditChatMessageDto): void;
  abstract deleteMessage(message: DeleteChatMessageDto): void;
  abstract readMessage(message: ReadChatMessageDto): void;
  abstract startTyping(typing: TypingInChatDto): void;

  // === Events (подписка на события) ===
  abstract onMessage(): Observable<OnChatMessageDto>;
  abstract onEditMessage(): Observable<OnEditChatMessageDto>;
  abstract onDeleteMessage(): Observable<OnDeleteChatMessageDto>;
  abstract onReadMessage(): Observable<OnReadChatMessageDto>;
  abstract onTyping(): Observable<TypingInChatEventDto>;
  abstract onSetOnline(): Observable<OnChangeStatus>;
  abstract onSetOffline(): Observable<OnChangeStatus>;
}
