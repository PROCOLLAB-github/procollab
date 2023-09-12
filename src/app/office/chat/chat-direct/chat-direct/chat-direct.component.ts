/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { filter, map, noop, Observable, Subscription, tap } from "rxjs";
import { ChatItem } from "@office/chat/models/chat-item.model";
import { ChatService } from "@services/chat.service";
import { ChatMessage } from "@models/chat-message.model";
import { LoadChatMessages } from "@models/chat.model";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";
import { ChatWindowComponent } from "@office/shared/chat-window/chat-window.component";
import { AuthService } from "@auth/services";

@Component({
  selector: "app-chat-direct",
  templateUrl: "./chat-direct.component.html",
  styleUrls: ["./chat-direct.component.scss"],
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

    this.chatService.connect().subscribe(() => {
      this.initMessageEvent();
      this.initTypingEvent();
      this.initDeleteEvent();
      this.initEditEvent();
    });

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

  private fetchMessages(): Observable<LoadChatMessages> {
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
      console.log(result);
    });

    messageEvent$ && this.subscriptions$.push(messageEvent$);
  }

  private initTypingEvent(): void {
    const typingEvent$ = this.chatService
      .onTyping()
      .pipe(
        map(() => {
          return this.chat?.users.find(u => u.id !== this.currentUserId);
        }),
        filter(Boolean)
      )
      .subscribe(person => {
        this.typingPersons.push({
          firstName: person.firstName,
          lastName: person.lastName,
          userId: person.id,
        });

        setTimeout(() => {
          const personIdx = this.typingPersons.findIndex(p => p.userId === person.id);

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
}
