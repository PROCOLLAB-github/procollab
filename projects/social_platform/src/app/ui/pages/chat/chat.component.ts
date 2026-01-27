/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ChatCardComponent } from "../../shared/chat-card/chat-card.component";
import { AsyncPipe } from "@angular/common";
import { BarComponent } from "@ui/components";
import { BackComponent } from "@uilib";
import { ChatInfoService } from "../../../api/chat/facedes/chat-info.service";
import { ChatUIInfoService } from "../../../api/chat/facedes/ui/chat-ui-info.service";

/**
 * Компонент списка чатов - отображает все чаты пользователя
 * Управляет отображением прямых и групповых чатов с сортировкой по непрочитанным
 *
 * Принимает:
 * - Данные чатов через резолвер
 * - События новых сообщений через WebSocket
 *
 * Возвращает:
 * - Отсортированный список чатов с индикаторами непрочитанных сообщений
 * - Навигацию к конкретным чатам
 */
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.scss",
  imports: [ChatCardComponent, AsyncPipe, BarComponent, BackComponent],
  providers: [ChatInfoService, ChatUIInfoService],
  standalone: true,
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly chatInfoService = inject(ChatInfoService);
  private readonly ChatUIInfoService = inject(ChatUIInfoService);

  protected readonly chatsData = this.ChatUIInfoService.chatsData;
  protected readonly chats = this.chatInfoService.chats;

  ngOnInit(): void {
    this.chatInfoService.initializationChats();
  }

  ngOnDestroy(): void {
    this.chatInfoService.destroy();
  }

  onGotoChat(id: string | number) {
    this.chatInfoService.onGotoChat(id);
  }
}
