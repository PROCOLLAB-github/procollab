/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from "@angular/cdk/scrolling";
import { ChatMessage } from "@domain/chat/chat-message.model";
import { MessageInputComponent } from "@ui/widgets/message-input/message-input.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { filter, fromEvent, noop, skip, tap, throttleTime } from "rxjs";
import { ModalService } from "@ui/primitives/modal/modal.service";
import { User } from "@domain/auth/user.model";
import { PluralizePipe } from "@corelib";
import { ChatMessageComponent } from "./chat-message/chat-message.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

/** Окно чата: список сообщений с виртуальной прокруткой и поле ввода. */
@Component({
  selector: "app-chat-window",
  templateUrl: "./chat-window.component.html",
  styleUrl: "./chat-window.component.scss",
  standalone: true,
  imports: [
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    ChatMessageComponent,
    ReactiveFormsModule,
    MessageInputComponent,
    PluralizePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(ModalService);
  private readonly profileInfoService = inject(ProfileInfoService);

  constructor() {
    this.messageForm = this.fb.group({
      messageControl: [{ text: "", filesUrl: [] }],
    });
  }

  private _messages: ChatMessage[] = [];

  @Input({ required: true }) set messages(value: ChatMessage[]) {
    const messagesIds = this._messages.map(m => m.id);
    // Находим новые сообщения
    const diff = value.filter(m => {
      return messagesIds.indexOf(m.id) < 0;
    });

    const noMessages = !this._messages.length;
    this._messages = value;

    // Автопрокрутка к низу для новых сообщений от текущего пользователя или при первой загрузке
    if ((diff.length === 1 && diff[0]?.author.id === this.profile()?.id) || noMessages) {
      this.scrollToBottom();
    }

    // Настройка наблюдателя для отметок о прочтении
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
    // Инициализация отслеживания печатания
    this.initTypingSend();
  }

  ngAfterViewInit(): void {
    if (this.viewport) {
      // Подписка на события прокрутки для загрузки истории
      fromEvent(this.viewport?.elementRef.nativeElement, "scroll")
        .pipe(
          skip(1), // Пропуск первого события прокрутки
          filter(() => {
            const offsetTop = this.viewport?.measureScrollOffset("top");
            return offsetTop ? offsetTop <= 200 : false; // Загрузка при приближении к верху
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.fetch.emit(); // Запрос дополнительных сообщений
        });

      // Создание наблюдателя пересечений для отметок о прочтении
      this.observer = new IntersectionObserver(this.onReadMessage.bind(this), {
        root: this.viewport.elementRef.nativeElement,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0,
      });
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected observer?: IntersectionObserver;
  protected readonly profile = this.profileInfoService.profile;

  private readonly messageControlBaseValue = {
    text: "",
    filesUrl: [],
  };

  messageForm: FormGroup;
  editingMessage?: ChatMessage;
  replyMessage?: ChatMessage;

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  @ViewChild(MessageInputComponent, { read: ElementRef }) messageInputComponent?: ElementRef;

  /** Отправляет событие печатания при изменении текста с задержкой. */
  private initTypingSend(): void {
    this.messageForm
      .get("messageControl")
      ?.valueChanges.pipe(
        throttleTime(2000), // Ограничение частоты отправки событий
        tap(() => {
          this.type.emit(); // Отправка события печатания
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(noop);
  }

  /** Прокрутка к низу (двойной setTimeout для виртуальной прокрутки). */
  private scrollToBottom(): void {
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
    if (!this.messageForm.get("messageControl")?.value.text) return;

    if (this.editingMessage) {
      // Редактирование существующего сообщения
      this.edit.emit({
        text: this.messageForm.get("messageControl")?.value.text,
        id: this.editingMessage.id,
      });

      this.editingMessage = undefined;
    } else {
      // Отправка нового сообщения
      this.submit.emit({
        replyTo: this.replyMessage?.id ?? null,
        text: this.messageForm.get("messageControl")?.value.text ?? "",
        fileUrls: this.messageForm.get("messageControl")?.value.filesUrl ?? [],
      });

      this.replyMessage = undefined;
    }

    // Очистка формы
    this.messageForm.get("messageControl")?.setValue(this.messageControlBaseValue);
  }

  /** Удаляет сообщение с модалкой подтверждения. */
  onDeleteMessage(messageId: number): void {
    const deletedMessage = this.messages.find(message => message.id === messageId);

    this.modalService
      .confirmDelete("Вы уверены что хотите удалить сообщение?", `"${deletedMessage?.text}"`)
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.delete.emit(messageId);
      });
  }

  onReadMessage(entries: IntersectionObserverEntry[]): void {
    entries.forEach(e => {
      const element = e.target as HTMLElement;
      // Отмечаем как прочитанное только непрочитанные сообщения
      !Number.parseInt(element.dataset["beenRead"] || "1") &&
        this.read.emit(Number.parseInt(element.id));
    });
  }
}
