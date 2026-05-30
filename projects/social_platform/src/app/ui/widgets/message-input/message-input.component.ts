/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ChatMessage } from "@domain/chat/chat-message.model";
import { fromEvent, map } from "rxjs";
import { FileService } from "@core/lib/services/file/file.service";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { AutosizeModule } from "ngx-autosize";
import { NgxMaskModule } from "ngx-mask";
import { IconComponent } from "@ui/primitives";
import { UpperCasePipe } from "@angular/common";
import { FormatedFileSizePipe } from "@corelib";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Компонент ввода сообщений для чата с поддержкой файлов, редактирования и ControlValueAccessor. */
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
    imports: [
        IconComponent,
        NgxMaskModule,
        AutosizeModule,
        FileTypePipe,
        FormatedFileSizePipe,
        UpperCasePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private readonly fileService: FileService) {}

  @Input() placeholder = "";
  @Input() mask = "";

  /** Приватное поле для хранения редактируемого сообщения */
  private _editingMessage?: ChatMessage;

  @Input()
  set editingMessage(message: ChatMessage | undefined) {
    this._editingMessage = message;

    // Иммутабельно перезаписываем value и пропагируем в форму — иначе textarea (OnPush) не обновится,
    // и при submit форма будет пустая (форма не знает что мы подставили текст).
    const newText = message !== undefined ? message.text : "";
    this.value = { ...this.value, text: newText };
    this.onChange(this.value);
    this.cdr.markForCheck();
  }

  get editingMessage(): ChatMessage | undefined {
    return this._editingMessage;
  }

  @Input() replyMessage?: ChatMessage;

  @Input()
  set appValue(value: MessageInputComponent["value"]) {
    this.value = value;
  }

  get appValue(): MessageInputComponent["value"] {
    return this.value;
  }

  @Output() appValueChange = new EventEmitter<MessageInputComponent["value"]>();
  @Output() submit = new EventEmitter<void>();
  @Output() resize = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit(): void {
    // Обработчик события dragover для всего документа
    fromEvent<DragEvent>(document, "dragover")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.handleDragOver.bind(this));

    // Обработчик события drop для всего документа
    fromEvent<DragEvent>(document, "drop")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.handleDrop.bind(this));
  }

  ngOnDestroy(): void {}

  private handleDragOver(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.showDropModal = true;
  }

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

  /** Значение компонента: текст и массив URL файлов */
  value: { text: string; filesUrl: string[] } = { text: "", filesUrl: [] };

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const newValue = { ...this.value, text: value };

    this.onChange(newValue);
    this.appValueChange.emit(newValue);
    this.value = newValue;
  }

  onBlur(): void {
    this.onTouch();
  }

  // Методы ControlValueAccessor
  writeValue(value: MessageInputComponent["value"]): void {
    setTimeout(() => {
      this.value = value;

      // Очистка списка файлов если нет URL файлов
      if (!value.filesUrl.length) {
        this.attachFiles = [];
      }

      // OnPush не перерисует textarea без явного markForCheck — без этого поле не очищается после submit
      this.cdr.markForCheck();
    });
  }

  /** Функция обратного вызова для уведомления об изменениях */
  // eslint-disable-next-line no-use-before-define
  onChange: (value: MessageInputComponent["value"]) => void = () => {};

  registerOnChange(fn: (v: MessageInputComponent["value"]) => void): void {
    this.onChange = fn;
  }

  /** Функция обратного вызова для уведомления о касании */
  onTouch: () => void = () => {};

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  /** Флаг отключения компонента */
  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

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

  onUpload(evt: Event) {
    const files = (evt.currentTarget as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    this.addFiles(files);
  }

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
        .pipe(
          map(r => r.url),
          takeUntilDestroyed(this.destroyRef)
        )
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

  onDeleteFile(idx: number): void {
    const file = this.attachFiles[idx];
    if (!file || !file.link) return;

    this.fileService
      .deleteFile(file.link)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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
