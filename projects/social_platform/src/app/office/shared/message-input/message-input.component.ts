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

@Component({
  selector: "app-message-input",
  templateUrl: "./message-input.component.html",
  styleUrl: "./message-input.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MessageInputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [IconComponent, NgxMaskModule, AutosizeModule, FileTypePipe, FormatedFileSizePipe],
})
export class MessageInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  constructor(private readonly fileService: FileService) {}

  @Input() placeholder = "";
  @Input() mask = "";

  private _editingMessage?: ChatMessage;
  @Input()
  set editingMessage(message: ChatMessage | undefined) {
    this._editingMessage = message;

    if (message !== undefined) {
      this.value.text = message.text;
    } else {
      this.value.text = "";
    }
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
    const dragOver$ = fromEvent<DragEvent>(document, "dragover")
      .pipe()
      .subscribe(this.handleDragOver.bind(this));
    dragOver$ && this.subscriptions$.push(dragOver$);

    const drop$ = fromEvent<DragEvent>(document, "drop").subscribe(this.handleDrop.bind(this));
    drop$ && this.subscriptions$.push(drop$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

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

  showDropModal = false;

  subscriptions$: Subscription[] = [];

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

  writeValue(value: MessageInputComponent["value"]): void {
    setTimeout(() => {
      this.value = value;

      if (!value.filesUrl.length) {
        this.attachFiles = [];
      }
    });
  }

  // eslint-disable-next-line no-use-before-define
  onChange: (value: MessageInputComponent["value"]) => void = () => {};

  registerOnChange(fn: (v: MessageInputComponent["value"]) => void): void {
    this.onChange = fn;
  }

  onTouch: () => void = () => {};

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

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

      textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);

      textarea.selectionStart = textarea.selectionEnd = start + 1;
      this.onInput(event);
    }
  }

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
    for (let i = 0; i < files.length; i++) {
      this.attachFiles.push({
        name: files[i].name,
        size: files[i].size.toString(),
        type: files[i].type,
        loading: true,
      });
    }

    for (let i = 0; i < files.length; i++) {
      this.fileService
        .uploadFile(files[i])
        .pipe(map(r => r.url))
        .subscribe({
          next: url => {
            this.value = {
              ...this.value,
              filesUrl: [...this.value.filesUrl, url],
            };

            this.onChange(this.value);

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

    this.fileService.deleteFile(file.link).subscribe(() => {
      this.attachFiles.splice(idx, 1);

      this.value.filesUrl.splice(idx, 1);

      this.onChange(this.value);
    });
  }

  protected readonly repl = module;
}
