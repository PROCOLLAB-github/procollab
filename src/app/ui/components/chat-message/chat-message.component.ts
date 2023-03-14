/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ChatMessage } from "@models/chat-message.model";
import { SnackbarService } from "@ui/services/snackbar.service";
import { TemplatePortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls: ["./chat-message.component.scss"],
})
export class ChatMessageComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly elRef: ElementRef,
    private readonly snackbarService: SnackbarService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly overlay: Overlay
  ) {}

  @Input() chatMessage!: ChatMessage;

  @Output() reply = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    this.templatePortal = new TemplatePortal(this.contextMenuTemplate, this.viewContainerRef);
  }

  @ViewChild("contextMenu") contextMenuTemplate!: TemplateRef<HTMLUListElement>;

  private overlayRef?: OverlayRef;
  private templatePortal?: TemplatePortal;

  onOpenContextmenu(event: MouseEvent) {
    event.preventDefault();

    const positionStrategy = this.overlay
      .position()
      .global()
      .left(event.clientX + "px")
      .top(event.clientY + "px");
    this.overlayRef?.updatePositionStrategy(positionStrategy);

    !this.overlayRef?.hasAttached() && this.overlayRef?.attach(this.templatePortal);
  }

  onCloseContextmenu() {
    this.overlayRef?.detach();
  }

  onClickContextmenu(event: MouseEvent) {
    event.stopPropagation();
  }

  onCopyContent(event: MouseEvent) {
    event.stopPropagation();

    this.overlayRef?.detach();

    navigator.clipboard.writeText(this.chatMessage.text).then(() => {
      this.snackbarService.success("Сообщение скопированно");
      console.debug("Text copied in ChatMessageComponent");
    });
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();

    this.delete.emit(this.chatMessage.id);
    this.overlayRef?.detach();
  }

  onReply(event: MouseEvent) {
    event.stopPropagation();

    this.reply.emit(this.chatMessage.id);
    this.overlayRef?.detach();
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();

    this.edit.emit(this.chatMessage.id);
    this.overlayRef?.detach();
  }
}
