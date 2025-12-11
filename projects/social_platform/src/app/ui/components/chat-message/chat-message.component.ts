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
import { ChatMessage } from "projects/social_platform/src/app/domain/chat/chat-message.model";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { DomPortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { DayjsPipe } from "projects/core";
import { IconComponent } from "@ui/components";
import { FileItemComponent } from "../file-item/file-item.component";
import { AsyncPipe } from "@angular/common";
import { AvatarComponent } from "../avatar/avatar.component";
import { ClickOutsideModule } from "ng-click-outside";
import { AuthService } from "../../../api/auth";

/**
 * Компонент сообщения в чате с контекстным меню и файловыми вложениями.
 * Отображает сообщение пользователя с возможностью ответа, редактирования и удаления.
 *
 * Входящие параметры:
 * - chatMessage: объект сообщения чата с текстом, автором, временем и вложениями
 *
 * События:
 * - reply: ответ на сообщение (передает ID сообщения)
 * - edit: редактирование сообщения (передает ID сообщения)
 * - delete: удаление сообщения (передает ID сообщения)
 *
 * Функциональность:
 * - Отображение аватара и информации об авторе
 * - Контекстное меню по правому клику
 * - Копирование текста сообщения в буфер обмена
 * - Отображение файловых вложений
 * - Форматирование времени отправки
 *
 * Использование:
 * - В списках сообщений чата
 * - Комментарии и обсуждения
 */
@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrl: "./chat-message.component.scss",
  standalone: true,
  imports: [
    ClickOutsideModule,
    AvatarComponent,
    FileItemComponent,
    IconComponent,
    AsyncPipe,
    DayjsPipe,
  ],
})
export class ChatMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly overlay: Overlay,
    public readonly authService: AuthService
  ) {}

  /** Объект сообщения чата */
  @Input({ required: true }) chatMessage!: ChatMessage;

  /** Событие ответа на сообщение */
  @Output() reply = new EventEmitter<number>();

  /** Событие редактирования сообщения */
  @Output() edit = new EventEmitter<number>();

  /** Событие удаления сообщения */
  @Output() delete = new EventEmitter<number>();

  ngOnInit(): void {}

  /** Инициализация overlay для контекстного меню */
  ngAfterViewInit(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
    });
    this.portal = new DomPortal(this.contextMenu);
  }

  /** Очистка ресурсов overlay */
  ngOnDestroy(): void {
    this.overlayRef?.detach();
  }

  /** Ссылка на элемент контекстного меню */
  @ViewChild("contextMenu") contextMenu!: ElementRef<HTMLUListElement>;

  /** Ссылка на overlay */
  private overlayRef?: OverlayRef;

  /** Portal для контекстного меню */
  private portal?: DomPortal;

  /** Состояние открытия контекстного меню */
  isOpen = false;

  /** Обработчик открытия контекстного меню по правому клику */
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

  /** Закрытие контекстного меню */
  onCloseContextmenu() {
    this.isOpen = false;
    this.overlayRef?.detach();
  }

  /** Копирование содержимого сообщения в буфер обмена */
  onCopyContent(event: MouseEvent) {
    event.stopPropagation();

    this.isOpen = false;
    this.overlayRef?.detach();

    navigator.clipboard.writeText(this.chatMessage.text).then(() => {
      this.snackbarService.success("Сообщение скопированно");
      console.debug("Text copied in ChatMessageComponent");
    });
  }

  /** Обработчик удаления сообщения */
  onDelete(event: MouseEvent) {
    event.stopPropagation();

    this.delete.emit(this.chatMessage.id);

    this.isOpen = false;
    this.overlayRef?.detach();
  }

  /** Обработчик ответа на сообщение */
  onReply(event: MouseEvent) {
    event.stopPropagation();

    this.reply.emit(this.chatMessage.id);

    this.isOpen = false;
    this.overlayRef?.detach();
  }

  /** Обработчик редактирования сообщения */
  onEdit(event: MouseEvent) {
    event.stopPropagation();

    this.edit.emit(this.chatMessage.id);

    this.isOpen = false;
    this.overlayRef?.detach();
  }
}
