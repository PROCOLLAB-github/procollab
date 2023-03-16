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
import { Subscription } from "rxjs";

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
export class MessageInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  constructor() {}

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
    // const dragOver$ = fromEvent<DragEvent>(document, "dragover")
    //   .pipe()
    //   .subscribe(this.handleDragOver.bind(this));
    // dragOver$ && this.subscriptions$.push(dragOver$);
    //
    // const drop$ = fromEvent<DragEvent>(document, "drop").subscribe(this.handleDrop.bind(this));
    // drop$ && this.subscriptions$.push(drop$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  // private handleDragOver(event: DragEvent): void {
  //   event.stopPropagation();
  //   event.preventDefault();
  //
  //   this.showDropModal = true;
  // }
  //
  // private handleDrop(event: DragEvent): void {
  //   event.stopPropagation();
  //   event.preventDefault();
  //
  //   const files = event.dataTransfer?.files;
  //   if (!files) return;
  //
  //   this.addFiles(files);
  //
  //   this.showDropModal = false;
  // }
  //
  // showDropModal = false;

  subscriptions$: Subscription[] = [];

  value: { text: string } = { text: "" };

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

  // attachFiles: {
  //   name: string;
  //   size: string;
  //   type: string;
  //   url?: string;
  //   loading: boolean;
  // }[] = [];

  // onUpload(evt: Event) {
  //   const files = (evt.currentTarget as HTMLInputElement).files;
  //
  //   if (!files?.length) {
  //     return;
  //   }
  //
  //   this.addFiles(files);
  // }

  // private addFiles(files: FileList): void {
  //   for (let i = 0; i < files.length; i++) {
  //     this.attachFiles.push({
  //       name: files[i].name,
  //       size: getFormattedFileSize(files[i].size),
  //       type: files[i].type.split("/")[1],
  //       loading: true,
  //     });
  //   }
  //
  //   for (let i = 0; i < files.length; i++) {
  //     this.fileService
  //       .uploadFile(files[i])
  //       .pipe(map(r => r.url))
  //       .subscribe({
  //         next: url => {
  //           this.value = {
  //             ...this.value,
  //             filesUrl: [...this.value.filesUrl, url],
  //           };
  //
  //           this.onChange(this.value);
  //
  //           setTimeout(() => {
  //             this.attachFiles[i].loading = false;
  //             this.attachFiles[i].url = url;
  //           });
  //         },
  //         complete: () => {
  //           setTimeout(() => {
  //             this.attachFiles[i].loading = false;
  //           });
  //         },
  //       });
  //   }
  // }

  // onDeleteFile(idx: number): void {
  //   const file = this.attachFiles[idx];
  //   if (!file || !file.url) return;
  //
  //   this.fileService.deleteFile(file.url).subscribe(() => {
  //     this.attachFiles.splice(idx, 1);
  //
  // this.value.filesUrl.splice(idx, 1);
  //
  //     this.onChange(this.value);
  //   });
  // }
}
