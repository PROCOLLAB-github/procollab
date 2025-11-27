/** @format */

import { Component, EventEmitter, Input, type OnInit, Output } from "@angular/core";
import type { Invite } from "@models/invite.model";
import { DayjsPipe } from "projects/core";
import { ButtonComponent } from "@ui/components";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";

/**
 * Компонент карточки управления приглашением
 *
 * Отображает информацию о приглашении в проект:
 * - Аватары пользователя и проекта
 * - Текст приглашения с ссылками на профиль и проект
 * - Время создания приглашения
 * - Кнопки принятия и отклонения
 *
 * @example
 * \`\`\`html
 * <app-invite-manage-card
 *   [invite]="invitation"
 *   (accept)="onAcceptInvite($event)"
 *   (reject)="onRejectInvite($event)">
 * </app-invite-manage-card>
 * \`\`\`
 */
@Component({
  selector: "app-invite-manage-card",
  templateUrl: "./invite-manage-card.component.html",
  styleUrl: "./invite-manage-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, RouterLink, ButtonComponent, DayjsPipe, TruncatePipe],
})
export class InviteManageCardComponent implements OnInit {
  constructor() {}

  /** Данные приглашения для отображения */
  @Input({ required: true }) invite!: Invite;

  /** Событие принятия приглашения (передает ID приглашения) */
  @Output() accept = new EventEmitter<number>();

  /** Событие отклонения приглашения (передает ID приглашения) */
  @Output() reject = new EventEmitter<number>();

  ngOnInit(): void {}
}
