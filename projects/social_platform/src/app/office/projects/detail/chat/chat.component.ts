/** @format */

import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ChatFile, ChatMessage } from "@models/chat-message.model";
import { filter, map, noop, Observable, Subscription, tap } from "rxjs";
import { Project } from "@models/project.model";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AuthService } from "@auth/services";
import { ModalService } from "@ui/models/modal.service";
import { ChatService } from "@services/chat.service";
import { MessageInputComponent } from "@office/shared/message-input/message-input.component";
import { ChatWindowComponent } from "@office/shared/chat-window/chat-window.component";
import { PluralizePipe } from "projects/core";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ApiPagination } from "@models/api-pagination.model";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.scss",
  standalone: true,
  imports: [
    AvatarComponent,
    IconComponent,
    ChatWindowComponent,
    RouterLink,
    FileItemComponent,
    PluralizePipe,
  ],
})
export class ProjectChatComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly chatService: ChatService
  ) { }

  /**
   * Project info
   * populates with observable call in {@link ngOnInit}
   */

  @Input() project?: Project;

  ngOnInit(): void {
    this.navService.setNavTitle("Чат проекта");

    const profile$ = this.authService.profile.subscribe(profile => {
      this.currentUserId = profile.id;
    });
    profile$ && this.subscriptions$.push(profile$);

    const projectSub$ = this.route.data.subscribe(r => {
      this.project = r['data'];
    }); // pull info about project
    projectSub$ && this.subscriptions$.push(projectSub$);

    console.debug("Chat websocket connected from ProjectChatComponent");

    this.initTypingEvent(); // event for show bare whenever anybody in chat type something
    this.initMessageEvent(); // Wait for messages from other member, insert into chat
    this.initEditEvent(); // Wait for messages to be edited by other members
    this.initDeleteEvent(); // Delete messages when following event comes from websocket

    this.fetchMessages().subscribe(noop);

    this.chatService
      .loadProjectFiles(Number(this.route.parent?.snapshot.paramMap.get("projectId")))
      .subscribe(files => {
        this.chatFiles = files;
      });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

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

  /**
   * Array with all rxjs subscriptions
   * unsubscribed in {@link ngOnDestroy}
   */
  subscriptions$: Subscription[] = [];

  /**
   * All files listed in this chat
   */
  chatFiles?: ChatFile[];

  /**
   * Get id of logged user
   */
  currentUserId?: number;

  /**
   * Input message component
   * Write edit reply to messages etc
   */
  @ViewChild(MessageInputComponent, { read: ElementRef }) messageInputComponent?: ElementRef;

  /**
   * All chat messages
   * Renders only few of them
   * See virtual scrolling {@link viewport}
   */
  messages: ChatMessage[] = [];

  /**
   * Amount of online users in chat
   * @deprecated
   */
  membersOnlineCount = 3;

  typingPersons: ChatWindowComponent["typingPersons"] = [];

  isAsideMobileShown = false;

  onToggleMobileAside(): void {
    this.isAsideMobileShown = !this.isAsideMobileShown;
  }

  private initTypingEvent(): void {
    const typingEvent$ = this.chatService
      .onTyping()
      .pipe(
        map(typingEvent =>
          this.project?.collaborators.find(
            collaborator => collaborator.userId === typingEvent.userId
          )
        ),
        filter(Boolean)
      )
      .subscribe(person => {
        if (
          !this.typingPersons.map(p => p.userId).includes(person.userId) &&
          person.userId !== this.currentUserId
        )
          this.typingPersons.push({
            firstName: person.firstName,
            lastName: person.lastName,
            userId: person.userId,
          });

        setTimeout(() => {
          const personIdx = this.typingPersons.findIndex(p => p.userId === person.userId);

          this.typingPersons.splice(personIdx, 1);
        }, 2000);
      });

    typingEvent$ && this.subscriptions$.push(typingEvent$);
  }

  private initMessageEvent(): void {
    const messageEvent$ = this.chatService.onMessage().subscribe(result => {
      this.messages = [...this.messages, result.message];
    });

    messageEvent$ && this.subscriptions$.push(messageEvent$);
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

  private fetchMessages(): Observable<ApiPagination<ChatMessage>> {
    return this.chatService
      .loadMessages(
        Number(this.route.parent?.snapshot.paramMap.get("projectId")),
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
      chatType: "project",
      chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
    });
  }

  onEditMessage(message: any): void {
    this.chatService.editMessage({
      text: message.text,
      messageId: message.id,
      chatType: "project",
      chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
    });
  }

  onDeleteMessage(messageId: number): void {
    this.chatService.deleteMessage({
      chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
      chatType: "project",
      messageId,
    });
  }
}
