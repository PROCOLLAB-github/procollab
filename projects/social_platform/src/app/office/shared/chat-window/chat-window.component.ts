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
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from "@angular/cdk/scrolling";
import { ChatMessage } from "@models/chat-message.model";
import { MessageInputComponent } from "@office/shared/message-input/message-input.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { filter, fromEvent, noop, skip, Subscription, tap, throttleTime } from "rxjs";
import { ModalService } from "@ui/models/modal.service";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { PluralizePipe } from "projects/core";
import { ChatMessageComponent } from "@ui/components/chat-message/chat-message.component";

/**
 * Компонент окна чата
 * Отображает список сообщений с виртуальной прокруткой и поле ввода нового сообщения
 * Поддерживает редактирование, ответы на сообщения, отметки о прочтении и индикацию печатания
 */
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
})
export class ChatWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Конструктор компонента
   * @param fb - FormBuilder для создания формы сообщения
   * @param modalService - сервис для отображения модальных окон
   * @param authService - сервис аутентификации для получения данных пользователя
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly authService: AuthService
  ) {
    // Создание формы для ввода сообщения
    this.messageForm = this.fb.group({
      messageControl: [{ text: "", filesUrl: [] }], // Контрол с текстом и файлами
    });
  }

  /** Приватное поле для хранения сообщений */
  private _messages: ChatMessage[] = [];

  /**
   * Сеттер для списка сообщений чата
   * Обновляет список сообщений и автоматически прокручивает к низу при новых сообщениях
   * Настраивает наблюдатель для отметок о прочтении
   * @param value - массив сообщений чата
   */
  @Input({ required: true }) set messages(value: ChatMessage[]) {
    const messagesIds = this._messages.map(m => m.id);
    // Находим новые сообщения
    const diff = value.filter(m => {
      return messagesIds.indexOf(m.id) < 0;
    });

    const noMessages = !this._messages.length;
    this._messages = value;

    // Автопрокрутка к низу для новых сообщений от текущего пользователя или при первой загрузке
    if ((diff.length === 1 && diff[0]?.author.id === this.profile?.id) || noMessages) {
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

  /**
   * Геттер для получения списка сообщений
   * @returns массив сообщений чата
   */
  get messages(): ChatMessage[] {
    return this._messages;
  }

  /**
   * Список пользователей, которые сейчас печатают
   */
  @Input()
  typingPersons: { firstName: string; lastName: string; userId: number }[] = [];

  // События компонента
  /** Событие отправки нового сообщения */
  @Output() submit = new EventEmitter<any>();
  /** Событие редактирования сообщения */
  @Output() edit = new EventEmitter<any>();
  /** Событие удаления сообщения */
  @Output() delete = new EventEmitter<number>();
  /** Событие начала печатания */
  @Output() type = new EventEmitter<void>();
  /** Событие запроса дополнительных сообщений */
  @Output() fetch = new EventEmitter<void>();
  /** Событие прочтения сообщения */
  @Output() read = new EventEmitter<number>();

  /**
   * Инициализация компонента
   * Подписывается на профиль пользователя и настраивает отслеживание печатания
   */
  ngOnInit(): void {
    // Подписка на профиль текущего пользователя
    const profile$ = this.authService.profile.subscribe(p => {
      this.profile = p;
    });
    this.subscriptions$.push(profile$);

    // Инициализация отслеживания печатания
    this.initTypingSend();
  }

  /**
   * Инициализация после отрисовки представления
   * Настраивает обработчик прокрутки для загрузки истории сообщений
   * Создает наблюдатель для отметок о прочтении
   */
  ngAfterViewInit(): void {
    if (this.viewport) {
      // Подписка на события прокрутки для загрузки истории
      const viewPortScroll$ = fromEvent(this.viewport?.elementRef.nativeElement, "scroll")
        .pipe(
          skip(1), // Пропуск первого события прокрутки
          filter(() => {
            const offsetTop = this.viewport?.measureScrollOffset("top");
            return offsetTop ? offsetTop <= 200 : false; // Загрузка при приближении к верху
          })
        )
        .subscribe(() => {
          this.fetch.emit(); // Запрос дополнительных сообщений
        });

      viewPortScroll$ && this.subscriptions$.push(viewPortScroll$);

      // Создание наблюдателя пересечений для отметок о прочтении
      this.observer = new IntersectionObserver(this.onReadMessage.bind(this), {
        root: this.viewport.elementRef.nativeElement,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0,
      });
    }
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /** Наблюдатель пересечений для отметок о прочтении */
  observer?: IntersectionObserver;
  /** Профиль текущего пользователя */
  profile?: User;

  /**
   * Базовое значение контрола сообщения
   */
  private readonly messageControlBaseValue = {
    text: "",
    filesUrl: [],
  };

  /** Форма для ввода сообщения */
  messageForm: FormGroup;
  /** Сообщение, которое редактируется */
  editingMessage?: ChatMessage;
  /** Сообщение, на которое отвечаем */
  replyMessage?: ChatMessage;

  /**
   * Элемент виртуальной прокрутки для оптимизации отображения большого количества сообщений
   */
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  /**
   * Компонент ввода сообщения
   */
  @ViewChild(MessageInputComponent, { read: ElementRef }) messageInputComponent?: ElementRef;

  /** Массив подписок для очистки */
  subscriptions$: Subscription[] = [];

  /**
   * Инициализация отслеживания печатания
   * Отправляет событие печатания при изменении текста с задержкой
   */
  private initTypingSend(): void {
    const messageControlSub$ = this.messageForm
      .get("messageControl")
      ?.valueChanges.pipe(
        throttleTime(2000), // Ограничение частоты отправки событий
        tap(() => {
          this.type.emit(); // Отправка события печатания
        })
      )
      .subscribe(noop);

    messageControlSub$ && this.subscriptions$.push(messageControlSub$);
  }

  /**
   * Прокрутка к низу списка сообщений
   * Использует двойной setTimeout для корректной работы с виртуальной прокруткой
   */
  private scrollToBottom(): void {
    // Sadly but it's work only this way
    // It seems that when first scrollTo works
    // It didn't render all elements so bottom 0 is not actual bottom of all comments
    setTimeout(() => {
      this.viewport?.scrollTo({ bottom: 0 });

      setTimeout(() => {
        this.viewport?.scrollTo({ bottom: 0 });
      }, 50);
    });
  }

  /**
   * Обработчик изменения размера поля ввода
   * Автоматически прокручивает к низу если пользователь находится внизу чата
   */
  onInputResize(): void {
    if (this.viewport && this.viewport.measureScrollOffset("bottom") < 50) this.scrollToBottom();
  }

  /**
   * Установка фокуса на поле ввода
   */
  private focusOnInput(): void {
    setTimeout(() => {
      this.messageInputComponent?.nativeElement.querySelector("textarea").focus();
    });
  }

  /**
   * Обработчик начала редактирования сообщения
   * @param messageId - идентификатор редактируемого сообщения
   */
  onEditMessage(messageId: number): void {
    this.replyMessage = undefined;
    this.editingMessage = this.messages.find(message => message.id === messageId);

    this.focusOnInput();
  }

  /**
   * Обработчик ответа на сообщение
   * @param messageId - идентификатор сообщения для ответа
   */
  onReplyMessage(messageId: number): void {
    this.editingMessage = undefined;
    this.replyMessage = this.messages.find(message => message.id === messageId);

    this.focusOnInput();
  }

  /**
   * Отмена редактирования или ответа
   */
  onCancelInput(): void {
    this.replyMessage = undefined;
    this.editingMessage = undefined;
  }

  /**
   * Обработчик отправки сообщения
   * Различает между редактированием существующего сообщения и отправкой нового
   */
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

  /**
   * Обработчик удаления сообщения
   * Показывает модальное окно подтверждения перед удалением
   * @param messageId - идентификатор удаляемого сообщения
   */
  onDeleteMessage(messageId: number): void {
    const deletedMessage = this.messages.find(message => message.id === messageId);

    this.modalService
      .confirmDelete("Вы уверены что хотите удалить сообщение?", `"${deletedMessage?.text}"`)
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.delete.emit(messageId);
      });
  }

  /**
   * Обработчик отметки сообщений как прочитанных
   * Вызывается наблюдателем пересечений когда сообщение становится видимым
   * @param entries - массив элементов, пересекающихся с областью видимости
   */
  onReadMessage(entries: IntersectionObserverEntry[]): void {
    entries.forEach(e => {
      const element = e.target as HTMLElement;
      // Отмечаем как прочитанное только непрочитанные сообщения
      !Number.parseInt(element.dataset["beenRead"] || "1") &&
        this.read.emit(Number.parseInt(element.id));
    });
  }
}
