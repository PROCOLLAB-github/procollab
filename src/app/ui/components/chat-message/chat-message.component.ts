/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ChatMessage } from "@models/chat-message";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls: ["./chat-message.component.scss"],
})
export class ChatMessageComponent implements OnInit {
  constructor(private readonly elRef: ElementRef<HTMLElement>) {}

  @Input() chatMessage!: ChatMessage;

  @Output() resend = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  ngOnInit(): void {}

  @ViewChild("messageEl") messageEl?: ElementRef<HTMLElement>;

  contextmenuOpen = false;
  contextmenuPos = { x: 0, y: 0 };

  onOpenContextmenu(event: MouseEvent) {
    event.preventDefault();

    this.contextmenuOpen = true;

    const target = this.elRef.nativeElement;
    const { x, y } = target.getBoundingClientRect();

    this.contextmenuPos.x = event.clientX - x;
    this.contextmenuPos.y = event.clientY - y;
  }

  onCloseContextmenu() {
    this.contextmenuOpen = false;
  }

  onCopyContent(event: MouseEvent) {
    event.stopPropagation();

    this.contextmenuOpen = false;

    navigator.clipboard.writeText(this.chatMessage.content).then(() => {
      console.debug("Text copied in ChatMessageComponent");
    });
  }

  onClickContextmenu(event: MouseEvent) {
    event.stopPropagation();
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();

    this.delete.emit(this.chatMessage.id);
    this.contextmenuOpen = false;
  }

  onResend(event: MouseEvent) {
    event.stopPropagation();

    this.resend.emit(this.chatMessage.id);
    this.contextmenuOpen = false;
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();

    this.edit.emit(this.chatMessage.id);
    this.contextmenuOpen = false;
  }
}
