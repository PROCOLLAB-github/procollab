/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { ChatMessage } from "@models/chat-message.model";
import { MessageInputComponent } from "@office/shared/message-input/message-input.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { filter, fromEvent, noop, skip, Subscription, tap, throttleTime } from "rxjs";
import { ModalService } from "@ui/models/modal.service";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-chat-window",
  templateUrl: "./chat-window.component.html",
  styleUrls: ["./chat-window.component.scss"],
})
export class ChatWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly authService: AuthService
  ) {
    this.messageForm = this.fb.group({
      messageControl: [{ text: "", filesUrl: [] }],
    });
  }

  private _messages: ChatMessage[] = [];
  /**
   * All chat messages
   * Renders only few of them
   * See virtual scrolling {@link viewport}
   */
  @Input() set messages(value: ChatMessage[]) {
    const messagesIds = this._messages.map(m => m.id);
    const diff = value.filter(m => {
      return messagesIds.indexOf(m.id) < 0;
    });

    const noMessages = !this._messages.length;
    this._messages = value;

    if ((diff.length === 1 && diff[0]?.author.id === this.profile?.id) || noMessages) {
      this.scrollToBottom();
    }

    setTimeout(() => {
      const elementNode = document.querySelectorAll(".chat__message");
      elementNode.forEach(el => {
        this.observer?.observe(el);
      });
    });
  }

  get messages(): ChatMessage[] {
    return this._messages;
  }

  @Input()
  typingPersons: { firstName: string; lastName: string; userId: number }[] = [];

  @Output() submit = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<number>();
  @Output() type = new EventEmitter<void>();
  @Output() fetch = new EventEmitter<void>();
  @Output() read = new EventEmitter<number>();

  ngOnInit(): void {
    const profile$ = this.authService.profile.subscribe(p => {
      this.profile = p;
    });
    this.subscriptions$.push(profile$);

    this.initTypingSend(); // event for send info to websocket, that current user is typing
  }

  ngAfterViewInit(): void {
    if (this.viewport) {
      const viewPortScroll$ = fromEvent(this.viewport?.elementRef.nativeElement, "scroll")
        .pipe(
          skip(1), // need skip first  scroll event because it's happens programmatically in ngOnInit hook

          filter(() => {
            const offsetTop = this.viewport?.measureScrollOffset("top"); // get amount of pixels that can be scrolled to the top of messages container
            return offsetTop ? offsetTop <= 200 : false;
          })
        )
        .subscribe(() => {
          this.fetch.emit();
        });

      viewPortScroll$ && this.subscriptions$.push(viewPortScroll$);

      this.observer = new IntersectionObserver(this.onReadMessage.bind(this), {
        root: this.viewport.elementRef.nativeElement,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0,
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  observer?: IntersectionObserver;

  profile?: User;

  /**
   * The placeholder value of form control
   * @private
   */
  private readonly messageControlBaseValue = {
    text: "",
    filesUrl: [],
  };

  messageForm: FormGroup;

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
   * The element in template that hold all messages
   * it from angular cdk virtual scrolling
   * need to not overpopulate browser engine by big amount of messages
   */
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  /**
   * Input message component
   * Write edit reply to messages etc
   */
  @ViewChild(MessageInputComponent, { read: ElementRef }) messageInputComponent?: ElementRef;

  subscriptions$: Subscription[] = [];

  private initTypingSend(): void {
    const messageControlSub$ = this.messageForm
      .get("messageControl")
      ?.valueChanges.pipe(
        throttleTime(2000),
        tap(() => {
          this.type.emit();
        })
      )
      .subscribe(noop);

    messageControlSub$ && this.subscriptions$.push(messageControlSub$);
  }

  private scrollToBottom(): void {
    // Sadly buy it's work only this way
    // It seems that when first scrollTo works
    // It didn't render all elements so bottom 0 is not actual bottom of all comments
    setTimeout(() => {
      this.viewport?.scrollTo({ bottom: 0 });

      setTimeout(() => {
        this.viewport?.scrollTo({ bottom: 0 });
      }, 50);
    });
  }

  onInputResize(): void {
    if (this.viewport && this.viewport.measureScrollOffset("bottom") < 50) this.scrollToBottom();
  }

  private focusOnInput(): void {
    setTimeout(() => {
      this.messageInputComponent?.nativeElement.querySelector("textarea").focus();
    });
  }

  onEditMessage(messageId: number): void {
    this.replyMessage = undefined;
    this.editingMessage = this.messages.find(message => message.id === messageId);

    this.focusOnInput();
  }

  onReplyMessage(messageId: number): void {
    this.editingMessage = undefined;
    this.replyMessage = this.messages.find(message => message.id === messageId);

    this.focusOnInput();
  }

  onCancelInput(): void {
    this.replyMessage = undefined;
    this.editingMessage = undefined;
  }

  onSubmitMessage() {
    if (!this.messageForm.get("messageControl")?.value.text.trim()) return;

    if (this.editingMessage) {
      this.edit.emit({
        text: this.messageForm.get("messageControl")?.value.text,
        id: this.editingMessage.id,
      });

      this.editingMessage = undefined;
    } else {
      this.submit.emit({
        replyTo: this.replyMessage?.id ?? null,
        text: this.messageForm.get("messageControl")?.value.text ?? "",
        fileUrls: this.messageForm.get("messageControl")?.value.filesUrl ?? [],
      });

      this.replyMessage = undefined;
    }

    this.messageForm.get("messageControl")?.setValue(this.messageControlBaseValue);
  }

  onDeleteMessage(messageId: number): void {
    const deletedMessage = this.messages.find(message => message.id === messageId);

    this.modalService
      .confirmDelete("Вы уверены что хотите удалить сообщение?", `“${deletedMessage?.text}”`)
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.delete.emit(messageId);
      });
  }

  onReadMessage(entries: IntersectionObserverEntry[]): void {
    entries.forEach(e => {
      const element = e.target as HTMLElement;
      !parseInt(element.dataset.beenRead || "1") && this.read.emit(parseInt(element.id));
    });
  }
}
