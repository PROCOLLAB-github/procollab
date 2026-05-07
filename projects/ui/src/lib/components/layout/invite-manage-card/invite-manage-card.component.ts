/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  type OnInit,
  Output,
} from "@angular/core";
import type { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { DayjsPipe } from "@corelib";
import { ButtonComponent } from "@ui/primitives";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
