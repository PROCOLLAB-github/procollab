/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
  input,
  output,
} from "@angular/core";
import { ChatMessage } from "@domain/chat/chat-message.model";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { DomPortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { DayjsPipe } from "@corelib";
import { IconComponent } from "@ui/primitives";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ClickOutsideModule } from "ng-click-outside";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

/** Компонент сообщения чата с контекстным меню и файловыми вложениями. */
@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrl: "./chat-message.component.scss",
  imports: [ClickOutsideModule, AvatarComponent, FileItemComponent, IconComponent, DayjsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly logger = inject(LoggerService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly overlay = inject(Overlay);
  private readonly profileInfoSerivce = inject(ProfileInfoService);

  protected readonly profile = this.profileInfoSerivce.profile;

  readonly chatMessage = input.required<ChatMessage>();

  readonly reply = output<number>();
  readonly edit = output<number>();
  readonly delete = output<number>();

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
    });
    this.portal = new DomPortal(this.contextMenu);
  }

  ngOnDestroy(): void {
    this.overlayRef?.detach();
  }

  @ViewChild("contextMenu") contextMenu!: ElementRef<HTMLUListElement>;

  private overlayRef?: OverlayRef;
  private portal?: DomPortal;

  isOpen = false;

  onOpenContextmenu(event: MouseEvent) {
    event.preventDefault();

    this.isOpen = true;

    const contextMenuHeight = this.contextMenu.nativeElement.offsetHeight;

    const positionX = event.clientX;
    const positionY =
      contextMenuHeight + event.clientY > window.innerHeight
        ? event.clientY - contextMenuHeight
        : event.clientY;

    const positionStrategy = this.overlay
      .position()
      .global()
      .left(positionX + "px")
      .top(positionY + "px");
    this.overlayRef?.updatePositionStrategy(positionStrategy);

    !this.overlayRef?.hasAttached() && this.overlayRef?.attach(this.portal);

    this.contextMenu.nativeElement.focus();
  }

  onCloseContextmenu() {
    this.isOpen = false;
    this.overlayRef?.detach();
  }

  onCopyContent(event: MouseEvent) {
    event.stopPropagation();

    this.isOpen = false;
    this.overlayRef?.detach();

    navigator.clipboard.writeText(this.chatMessage().text).then(() => {
      this.snackbarService.success("Сообщение скопированно");
      this.logger.debug("Text copied in ChatMessageComponent");
    });
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();

    this.delete.emit(this.chatMessage().id);

    this.isOpen = false;
    this.overlayRef?.detach();
  }

  onReply(event: MouseEvent) {
    event.stopPropagation();

    this.reply.emit(this.chatMessage().id);

    this.isOpen = false;
    this.overlayRef?.detach();
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();

    this.edit.emit(this.chatMessage().id);

    this.isOpen = false;
    this.overlayRef?.detach();
  }
}
