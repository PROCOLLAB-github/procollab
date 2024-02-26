/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, noop, Observable, Subscription, tap } from "rxjs";
import { ChatItem } from "@office/chat/models/chat-item.model";
import { ChatService } from "@services/chat.service";
import { ChatMessage } from "@models/chat-message.model";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";
import { ChatWindowComponent } from "@office/shared/chat-window/chat-window.component";
import { AuthService } from "@auth/services";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { BackComponent } from "@ui/components/back/back.component";
import { ApiPagination } from "@models/api-pagination.model";

@Component({
  selector: "app-chat-direct",
  templateUrl: "./chat-direct.component.html",
  styleUrl: "./chat-direct.component.scss",
  standalone: true,
  imports: [BackComponent, RouterLink, AvatarComponent, ChatWindowComponent],
})
export class ChatDirectComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly chatDirectService: ChatDirectService
  ) {}

  ngOnInit(): void {
    const routeData$ = this.route.data.pipe(map(r => r["data"])).subscribe(chat => {
      this.chat = chat;
    });
    this.subscriptions$.push(routeData$);

    this.fetchMessages().subscribe(noop);

    this.initMessageEvent();
    this.initTypingEvent();
    this.initDeleteEvent();
    this.initEditEvent();
    this.initReadEvent();

    this.authService.profile.subscribe(u => {
      this.currentUserId = u.id;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  currentUserId?: number;

  /**
   * Amount of messages that we fetch
   * each time {@link fetchMessages} runs
   * @private
   */
  private readonly messagesPerFetch = 20;
  /**
   * Total messages count in chat
   * comes from server, set first time {@link fetchMessages} runs
   * @private
   */
  private messagesTotalCount = 0;

  typingPersons: ChatWindowComponent["typingPersons"] = [];

  subscriptions$: Subscription[] = [];

  chat?: ChatItem;

  messages: ChatMessage[] = [];

  private fetchMessages(): Observable<ApiPagination<ChatMessage>> {
    return this.chatDirectService
      .loadMessages(
        this.chat?.id ?? "",
        this.messages.length > 0 ? this.messages.length : 0,
        this.messagesPerFetch
      )
      .pipe(
        tap(messages => {
          this.messages = messages.results.reverse().concat(this.messages);
          this.messagesTotalCount = messages.count;
        })
      );
  }

  private initMessageEvent(): void {
    const messageEvent$ = this.chatService.onMessage().subscribe(result => {
      this.messages = [...this.messages, result.message];
    });

    messageEvent$ && this.subscriptions$.push(messageEvent$);
  }

  private initTypingEvent(): void {
    const typingEvent$ = this.chatService
      .onTyping()

      .subscribe(() => {
        if (!this.chat?.opponent) return;
        this.typingPersons.push({
          firstName: this.chat.opponent.firstName,
          lastName: this.chat.opponent.lastName,
          userId: this.chat.opponent.id,
        });

        setTimeout(() => {
          const personIdx = this.typingPersons.findIndex(p => p.userId === this.chat?.opponent.id);

          this.typingPersons.splice(personIdx, 1);
        }, 2000);
      });

    typingEvent$ && this.subscriptions$.push(typingEvent$);
  }

  private initEditEvent(): void {
    const editEvent$ = this.chatService.onEditMessage().subscribe(result => {
      const messageIdx = this.messages.findIndex(msg => msg.id === result.message.id);

      const messages = JSON.parse(JSON.stringify(this.messages));
      messages.splice(messageIdx, 1, result.message);

      this.messages = messages;
    });

    editEvent$ && this.subscriptions$.push(editEvent$);
  }

  private initDeleteEvent(): void {
    const deleteEvent$ = this.chatService.onDeleteMessage().subscribe(result => {
      const messageIdx = this.messages.findIndex(msg => msg.id === result.messageId);

      const messages = JSON.parse(JSON.stringify(this.messages));
      messages.splice(messageIdx, 1);

      this.messages = messages;
    });

    deleteEvent$ && this.subscriptions$.push(deleteEvent$);
  }

  private initReadEvent(): void {
    const readEvent$ = this.chatService.onReadMessage().subscribe(result => {
      const messageIdx = this.messages.findIndex(msg => msg.id === result.messageId);

      const messages = JSON.parse(JSON.stringify(this.messages));
      messages.splice(messageIdx, 1, { ...messages[messageIdx], isRead: true });

      this.messages = messages;
    });

    readEvent$ && this.subscriptions$.push(readEvent$);
  }

  fetching = false;
  onFetchMessages(): void {
    if (
      (this.messages.length < this.messagesTotalCount ||
        // because messagesTotalCount pulls from server it's 0 in start of program, in that case we also need to make fetch
        this.messagesTotalCount === 0) &&
      !this.fetching
    ) {
      this.fetching = true;
      this.fetchMessages().subscribe(() => {
        this.fetching = false;
      });
    }
  }

  onSubmitMessage(message: any): void {
    this.chatService.sendMessage({
      replyTo: message.replyTo,
      text: message.text,
      fileUrls: message.fileUrls,
      chatType: "direct",
      chatId: this.chat?.id ?? "",
    });
  }

  onEditMessage(message: any): void {
    this.chatService.editMessage({
      text: message.text,
      messageId: message.id,
      chatType: "direct",
      chatId: this.chat?.id ?? "",
    });
  }

  onDeleteMessage(messageId: number): void {
    this.chatService.deleteMessage({
      chatId: this.chat?.id ?? "",
      chatType: "direct",
      messageId,
    });
  }

  onType() {
    this.chatService.startTyping({ chatType: "direct", chatId: this.chat?.id ?? "" });
  }

  onReadMessage(messageId: number) {
    this.chatService.readMessage({
      chatType: "direct",
      chatId: this.chat?.id ?? "",
      messageId,
    });
  }
}
