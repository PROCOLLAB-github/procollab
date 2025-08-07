/** @format */

import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ChatMessage } from "@models/chat-message.model";
import { fromEvent, map, Subscription } from "rxjs";
import { FileService } from "@core/services/file.service";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { AutosizeModule } from "ngx-autosize";
import { NgxMaskModule } from "ngx-mask";
import { IconComponent } from "@ui/components";
import { FormatedFileSizePipe } from "@core/pipes/formatted-file-size.pipe";

/**
 * Компонент ввода сообщений для чата
 * Предоставляет расширенный интерфейс для ввода текстовых сообщений с поддержкой:
 * - Автоматического изменения размера текстового поля
 * - Прикрепления файлов через выбор или drag&drop
 * - Редактирования существующих сообщений
 * - Ответов на сообщения
 * - Масок ввода для специальных форматов
 *
 * Реализует ControlValueAccessor для интеграции с Angular Forms
 */
@Component({
  selector: "app-message-input",
  templateUrl: "./message-input.component.html",
  styleUrl: "./message-input.component.scss",
  providers: [
    {
      // Регистрация как ControlValueAccessor для работы с формами
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MessageInputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [IconComponent, NgxMaskModule, AutosizeModule, FileTypePipe, FormatedFileSizePipe],
})
export class MessageInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /**
   * Конструктор компонента
   * @param fileService - сервис для работы с файлами (загрузка, удаление)
   */
  constructor(private readonly fileService: FileService) {}

  /** Текст placeholder для поля ввода */
  @Input() placeholder = "";
  /** Маска для форматирования ввода */
  @Input() mask = "";

  /** Приватное поле для хранения редактируемого сообщения */
  private _editingMessage?: ChatMessage;

  /**
   * Сеттер для сообщения, которое редактируется
   * При установке сообщения для редактирования, его текст загружается в поле ввода
   * @param message - сообщение для редактирования или undefined для отмены
   */
  @Input()
  set editingMessage(message: ChatMessage | undefined) {
    this._editingMessage = message;

    if (message !== undefined) {
      this.value.text = message.text;
    } else {
      this.value.text = "";
    }
  }

  /**
   * Геттер для получения редактируемого сообщения
   * @returns сообщение для редактирования или undefined
   */
  get editingMessage(): ChatMessage | undefined {
    return this._editingMessage;
  }

  /** Сообщение, на которое отвечаем */
  @Input() replyMessage?: ChatMessage;

  /**
   * Сеттер для значения компонента
   * @param value - объект с текстом и массивом URL файлов
   */
  @Input()
  set appValue(value: MessageInputComponent["value"]) {
    this.value = value;
  }

  /**
   * Геттер для получения значения компонента
   * @returns объект с текстом и массивом URL файлов
   */
  get appValue(): MessageInputComponent["value"] {
    return this.value;
  }

  // События компонента
  /** Событие изменения значения */
  @Output() appValueChange = new EventEmitter<MessageInputComponent["value"]>();
  /** Событие отправки сообщения */
  @Output() submit = new EventEmitter<void>();
  /** Событие изменения размера поля ввода */
  @Output() resize = new EventEmitter<void>();
  /** Событие отмены редактирования/ответа */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Инициализация компонента
   * Настраивает обработчики drag&drop для загрузки файлов
   */
  ngOnInit(): void {
    // Обработчик события dragover для всего документа
    const dragOver$ = fromEvent<DragEvent>(document, "dragover")
      .pipe()
      .subscribe(this.handleDragOver.bind(this));
    dragOver$ && this.subscriptions$.push(dragOver$);

    // Обработчик события drop для всего документа
    const drop$ = fromEvent<DragEvent>(document, "drop").subscribe(this.handleDrop.bind(this));
    drop$ && this.subscriptions$.push(drop$);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * Обработчик события dragover
   * Предотвращает стандартное поведение и показывает модальное окно для drop
   * @param event - событие dragover
   */
  private handleDragOver(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.showDropModal = true;
  }

  /**
   * Обработчик события drop
   * Обрабатывает перетаскиваемые файлы и скрывает модальное окно
   * @param event - событие drop
   */
  private handleDrop(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();

    const files = event.dataTransfer?.files;
    if (!files) return;

    this.addFiles(files);
    this.showDropModal = false;
  }

  /** Флаг отображения модального окна для drag&drop */
  showDropModal = false;
  /** Массив подписок для очистки */
  subscriptions$: Subscription[] = [];

  /** Значение компонента: текст и массив URL файлов */
  value: { text: string; filesUrl: string[] } = { text: "", filesUrl: [] };

  /**
   * Обработчик ввода текста
   * @param event - событие ввода
   */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const newValue = { ...this.value, text: value };

    this.onChange(newValue);
    this.appValueChange.emit(newValue);
    this.value = newValue;
  }

  /**
   * Обработчик потери фокуса
   */
  onBlur(): void {
    this.onTouch();
  }

  // Методы ControlValueAccessor
  /**
   * Установка значения в компонент (ControlValueAccessor)
   * @param value - значение для установки
   */
  writeValue(value: MessageInputComponent["value"]): void {
    setTimeout(() => {
      this.value = value;

      // Очистка списка файлов если нет URL файлов
      if (!value.filesUrl.length) {
        this.attachFiles = [];
      }
    });
  }

  /** Функция обратного вызова для уведомления об изменениях */
  // eslint-disable-next-line no-use-before-define
  onChange: (value: MessageInputComponent["value"]) => void = () => {};

  /**
   * Регистрация функции обратного вызова для изменений (ControlValueAccessor)
   * @param fn - функция для вызова при изменении значения
   */
  registerOnChange(fn: (v: MessageInputComponent["value"]) => void): void {
    this.onChange = fn;
  }

  /** Функция обратного вызова для уведомления о касании */
  onTouch: () => void = () => {};

  /**
   * Регистрация функции обратного вызова для касания (ControlValueAccessor)
   * @param fn - функция для вызова при касании компонента
   */
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  /** Флаг отключения компонента */
  disabled = false;

  /**
   * Установка состояния отключения (ControlValueAccessor)
   * @param isDisabled - флаг отключения
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /**
   * Обработчик нажатия клавиш в textarea
   * Обрабатывает Tab для вставки символа табуляции
   * @param event - событие клавиатуры
   */
  onTextareaKeydown(event: any) {
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Вставка символа табуляции в позицию курсора
      textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      this.onInput(event);
    }
  }

  /** Массив прикрепленных файлов с метаданными */
  attachFiles: {
    name: string;
    size: string;
    type: string;
    link?: string;
    loading: boolean;
  }[] = [];

  /**
   * Обработчик загрузки файлов через input
   * @param evt - событие выбора файлов
   */
  onUpload(evt: Event) {
    const files = (evt.currentTarget as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    this.addFiles(files);
  }

  /**
   * Добавление файлов для загрузки
   * Создает записи в массиве attachFiles и запускает загрузку на сервер
   * @param files - список файлов для загрузки
   */
  private addFiles(files: FileList): void {
    // Создание записей для каждого файла
    for (let i = 0; i < files.length; i++) {
      this.attachFiles.push({
        name: files[i].name,
        size: files[i].size.toString(),
        type: files[i].type,
        loading: true,
      });
    }

    // Загрузка каждого файла на сервер
    for (let i = 0; i < files.length; i++) {
      this.fileService
        .uploadFile(files[i])
        .pipe(map(r => r.url))
        .subscribe({
          next: url => {
            // Обновление значения компонента с новым URL файла
            this.value = {
              ...this.value,
              filesUrl: [...this.value.filesUrl, url],
            };

            this.onChange(this.value);

            // Обновление метаданных файла
            setTimeout(() => {
              this.attachFiles[i].loading = false;
              this.attachFiles[i].link = url;
            });
          },
          complete: () => {
            setTimeout(() => {
              this.attachFiles[i].loading = false;
            });
          },
        });
    }
  }

  /**
   * Удаление файла
   * Удаляет файл с сервера и из списка прикрепленных файлов
   * @param idx - индекс файла в массиве attachFiles
   */
  onDeleteFile(idx: number): void {
    const file = this.attachFiles[idx];
    if (!file || !file.link) return;

    this.fileService.deleteFile(file.link).subscribe(() => {
      // Удаление из массива прикрепленных файлов
      this.attachFiles.splice(idx, 1);
      // Удаление URL из значения компонента
      this.value.filesUrl.splice(idx, 1);
      this.onChange(this.value);
    });
  }

  /** Ссылка на модуль для совместимости */
  protected readonly repl = module;
}
