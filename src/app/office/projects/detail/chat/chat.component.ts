/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ChatMessage } from "@models/chat-message.model";
import {
  exhaustMap,
  filter,
  fromEvent,
  map,
  noop,
  Observable,
  skip,
  Subscription,
  tap,
  throttleTime,
} from "rxjs";
import { Project } from "@models/project.model";
import { NavService } from "@services/nav.service";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "@auth/services";
import { ModalService } from "@ui/models/modal.service";
import { ChatService } from "@services/chat.service";
import { LoadChatMessages } from "@models/chat.model";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ProjectChatComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly chatService: ChatService
  ) {
    this.messageForm = this.fb.group({
      messageControl: [this.messageControlBaseValue],
    }); // the form for send, edit messages
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Чат проекта");

    const profile$ = this.authService.profile.subscribe(profile => {
      this.currentUserId = profile.id;
    });
    profile$ && this.subscriptions$.push(profile$);

    const projectSub$ = this.route.data.pipe(map(r => r["data"])).subscribe(project => {
      this.project = project;
    }); // pull info about project
    projectSub$ && this.subscriptions$.push(projectSub$);

    const chatSub$ = this.chatService.connect().subscribe(() => {
      // connecting to chats websocket
      console.debug("Chat websocket connected from ProjectChatComponent");

      this.initTypingEvent(); // event for show bare whenever anybody in chat type something
      this.initMessageEvent(); // Wait for messages from other member, insert into chat
      this.initEditEvent(); // Wait for messages to be edited by other members
      this.initDeleteEvent(); // Delete messages when following event comes from websocket
    });
    chatSub$ && this.subscriptions$.push(chatSub$);

    this.initTypingSend(); // event for send info to websocket, that current user is typing

    this.fetchMessages().subscribe(() => {
      // after all messages fetched we need to scroll down
      this.scrollToBottom();
    });
  }

  ngAfterViewInit(): void {
    if (this.viewport) {
      const viewPortScroll$ = fromEvent(this.viewport?.elementRef.nativeElement, "scroll")
        .pipe(
          skip(1), // need skip first  scroll event because it's happens programmatically in ngOnInit hook
          filter(
            // if we have messages greater or equal than we can have in total we need to skip event
            () =>
              this.messages.length >= this.messagesTotalCount ||
              // because messagesTotalCount pulls from server it's 0 in start of program, in that case we also need to skp event
              this.messagesTotalCount !== 0
          ),
          filter(() => {
            const offsetTop = this.viewport?.measureScrollOffset("top"); // get amount of pixels that can be scrolled to the top of messages container
            return offsetTop ? offsetTop < 200 : false;
          }),
          exhaustMap(() => this.fetchMessages())
        )
        .subscribe(noop);

      viewPortScroll$ && this.subscriptions$.push(viewPortScroll$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * The placeholder value of form control
   * @private
   */
  private readonly messageControlBaseValue = {
    text: "",
  };

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
   * Project info
   * populates with observable call in {@link ngOnInit}
   */
  project?: Project;

  /**
   * Get id of logged user
   */
  currentUserId?: number;
  messageForm: FormGroup;

  /**
   * The element in template that hold all messages
   * it from angular cdk virtual scrolling
   * need to not overpopulate browser engine by big amount of messages
   */
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  /**
   * All chat messages
   * Renders only few of them
   * See virtual scrolling {@link viewport}
   */
  messages: ChatMessage[] = [];

  /**
   * Message that user want to edit
   * set from {@link onEditMessage}
   */
  editingMessage?: ChatMessage;
  /**
   * Message that user want to reply
   * set from {@link onReplyMessage}
   */
  replyMessage?: ChatMessage;

  /**
   * Amount of online users in chat
   * @deprecated
   */
  membersOnlineCount = 3;

  private initTypingSend(): void {
    const messageControlSub$ = this.messageForm
      .get("messageControl")
      ?.valueChanges.pipe(
        throttleTime(2000),
        tap(() => {
          this.chatService.startTyping({
            chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
            chatType: "project",
          });
        })
      )
      .subscribe(noop);

    messageControlSub$ && this.subscriptions$.push(messageControlSub$);
  }

  typingPersons: Project["collaborators"] = [];

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
          this.typingPersons.push(person);

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

    this.scrollToBottom();
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

  private fetchMessages(): Observable<LoadChatMessages> {
    return this.chatService
      .loadMessage(
        Number(this.route.parent?.snapshot.paramMap.get("projectId")),
        this.messages.length,
        this.messagesPerFetch
      )
      .pipe(
        tap(messages => {
          this.messages = messages.results.concat(this.messages);
          this.messagesTotalCount = messages.count;
        })
      );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.viewport?.scrollToIndex(999999);
    });
  }

  onSubmitMessage(): void {
    if (this.editingMessage) {
      this.chatService.editMessage({
        text: this.messageForm.get("messageControl")?.value.text,
        messageId: this.editingMessage.id,
        chatType: "project",
        chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
      });
    } else {
      this.chatService.sendMessage({
        replyTo: this.replyMessage?.id ?? null,
        text: this.messageForm.get("messageControl")?.value.text ?? "",
        chatType: "project",
        chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
      });
    }

    this.messageForm.get("messageControl")?.setValue(this.messageControlBaseValue);
  }

  onInputResize(): void {
    if (this.viewport?.getOffsetToRenderedContentStart()) this.viewport?.scrollToIndex(99999);
  }

  onDeleteMessage(messageId: number): void {
    const deletedMessage = this.messages.find(message => message.id === messageId);

    this.modalService
      .confirmDelete("Вы уверены что хотите удалить сообщение?", `“${deletedMessage?.text}”`)
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.chatService.deleteMessage({
          chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
          chatType: "project",
          messageId,
        });
      });
  }

  onEditMessage(messageId: number): void {
    this.replyMessage = undefined;
    this.editingMessage = this.messages.find(message => message.id === messageId);

    this.scrollToBottom();
  }

  onReplyMessage(messageId: number): void {
    this.editingMessage = undefined;
    this.replyMessage = this.messages.find(message => message.id === messageId);

    this.scrollToBottom();
  }

  onCancelInput(): void {
    this.replyMessage = undefined;
    this.editingMessage = undefined;
  }
}
