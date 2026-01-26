/** @format */

import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  ChatFile,
  ChatMessage,
} from "projects/social_platform/src/app/domain/chat/chat-message.model";
import { filter, map, noop, Observable, tap } from "rxjs";
import { NavService } from "@ui/services/nav/nav.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ChatService } from "projects/social_platform/src/app/api/chat/chat.service";
import { MessageInputComponent } from "@ui/components/message-input/message-input.component";
import { ChatWindowComponent } from "@ui/components/chat-window/chat-window.component";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";
import { ChatDirectInfoService } from "projects/social_platform/src/app/api/chat/facedes/chat-direct-info.service";
import { ChatDirectUIInfoService } from "projects/social_platform/src/app/api/chat/facedes/ui/chat-direct-ui-info.service";

/**
 * Компонент чата проекта
 *
 * Функциональность:
 * - Отображение чата проекта с сообщениями участников
 * - Отправка, редактирование и удаление сообщений
 * - Показ индикатора набора текста
 * - Загрузка файлов чата
 * - Пагинация сообщений при прокрутке
 * - Мобильная версия с переключением между чатом и боковой панелью
 *
 * Принимает:
 * - Данные проекта через ActivatedRoute
 * - WebSocket события через ChatService
 * - Профиль пользователя через AuthService
 *
 * Предоставляет:
 * - Список сообщений чата
 * - Список участников проекта
 * - Файлы, загруженные в чат
 * - Интерфейс для отправки сообщений
 */
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.scss",
  standalone: true,
  imports: [AvatarComponent, IconComponent, ChatWindowComponent, RouterLink, FileItemComponent],
  providers: [ChatDirectInfoService, ChatDirectUIInfoService],
})
export class ProjectChatComponent implements OnInit, OnDestroy {
  /** Ссылка на компонент ввода сообщений */
  @ViewChild(MessageInputComponent, { read: ElementRef }) messageInputComponent?: ElementRef;

  private readonly navService = inject(NavService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly chatDirectInfoService = inject(ChatDirectInfoService);
  private readonly chatDirectUIInfoService = inject(ChatDirectUIInfoService);

  /** Данные проекта */
  readonly project = this.projectsDetailUIInfoService.project;

  /** Все файлы, загруженные в чат */
  protected readonly chatFiles = this.chatDirectUIInfoService.chatFiles;

  /** ID текущего пользователя */
  protected readonly currentUserId = this.chatDirectUIInfoService.currentUserId;

  /** Все сообщения чата */
  protected readonly messages = this.chatDirectUIInfoService.messages;

  /** Список пользователей, которые сейчас печатают */
  protected readonly typingPersons = this.chatDirectUIInfoService.typingPersons;

  /** Флаг отображения боковой панели на мобильных устройствах */
  protected readonly isAsideMobileShown = this.chatDirectUIInfoService.isAsideMobileShown;

  /** Флаг процесса загрузки сообщений */
  protected readonly fetching = this.chatDirectUIInfoService.fetching;

  ngOnInit(): void {
    this.navService.setNavTitle("Чат проекта");

    this.chatDirectInfoService.initializationChatDirect("project");

    this.chatDirectInfoService.initializationChatFiles();
  }

  ngOnDestroy(): void {
    this.chatDirectInfoService.destroy();
  }

  onToggleMobileAside(): void {
    this.chatDirectUIInfoService.onToggleMobileAside();
  }

  /** Загрузка дополнительных сообщений при прокрутке */
  onFetchMessages(): void {
    this.chatDirectInfoService.onFetchMessages();
  }

  /** Отправка нового сообщения */
  onSubmitMessage(message: any): void {
    this.chatDirectInfoService.onSubmitMessage(message);
  }

  /** Редактирование существующего сообщения */
  onEditMessage(message: any): void {
    this.chatDirectInfoService.onEditMessage(message);
  }

  /** Удаление сообщения */
  onDeleteMessage(messageId: number): void {
    this.chatDirectInfoService.onDeleteMessage(messageId);
  }
}
