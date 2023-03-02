/** @format */

import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ChatMessage } from "@models/chat-message.model";
import { map } from "rxjs";
import { FileService } from "@core/services/file.service";

@Component({
  selector: "app-message-input",
  templateUrl: "./message-input.component.html",
  styleUrls: ["./message-input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MessageInputComponent),
      multi: true,
    },
  ],
})
export class MessageInputComponent implements OnInit, ControlValueAccessor {
  constructor(private readonly fileService: FileService) {}

  @Input() placeholder = "";
  @Input() mask = "";

  private _editingMessage?: ChatMessage;
  @Input()
  set editingMessage(message: ChatMessage | undefined) {
    this._editingMessage = message;

    if (message !== undefined) {
      this.value.text = message.content;
    } else {
      this.value.text = "";
    }
  }

  get editingMessage(): ChatMessage | undefined {
    return this._editingMessage;
  }

  @Input()
  set appValue(value: MessageInputComponent["value"]) {
    this.value = value;
  }

  get appValue(): MessageInputComponent["value"] {
    return this.value;
  }

  @Output() appValueChange = new EventEmitter<MessageInputComponent["value"]>();
  @Output() enter = new EventEmitter<void>();
  @Output() resize = new EventEmitter<void>();

  ngOnInit(): void {}

  value: { text: string; filesUrl: string[] } = { text: "", filesUrl: [] };

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const newValue = { ...this.value, text: value };

    this.onChange(newValue);
    this.appValueChange.emit(newValue);
  }

  onBlur(): void {
    this.onTouch();
  }

  writeValue(value: MessageInputComponent["value"]): void {
    setTimeout(() => {
      this.value = value;
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

  loadingFiles: {
    name: string;
    size: string;
    type: string;
  }[] = [];

  private getFormattedFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];

    if (bytes === 0) return "0 Byte";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = Math.round(bytes / Math.pow(1024, i)).toFixed(1);

    return `${size} ${sizes[i]}`;
  }

  onUpload(evt: Event) {
    const files = (evt.currentTarget as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      this.loadingFiles.push({
        name: files[i].name,
        size: this.getFormattedFileSize(files[i].size),
        type: files[i].type,
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
              this.loadingFiles.splice(i, 1);
            });
          },
          complete: () => {
            setTimeout(() => {
              this.loadingFiles.splice(i, 1);
            });
          },
        });
    }
  }
}
