/** @format */

import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ChatMessage } from "@models/chat-message.model";

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
  constructor() {}

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

  value: { text: string; filesUrl: [] } = { text: "", filesUrl: [] };

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
}
