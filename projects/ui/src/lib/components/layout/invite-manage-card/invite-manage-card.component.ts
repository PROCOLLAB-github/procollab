/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  type OnInit,
  output,
  Output,
} from "@angular/core";
import type { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { ButtonComponent } from "../../primitives/button/button.component";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "../../primitives/avatar/avatar.component";
import { TruncatePipe } from "@corelib";

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
  imports: [AvatarComponent, RouterLink, ButtonComponent, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteManageCardComponent implements OnInit {
  /** Данные приглашения для отображения */
  readonly invite = input.required<Invite>();

  /** Событие принятия приглашения (передает ID приглашения) */
  readonly accept = output<number>();

  /** Событие отклонения приглашения (передает ID приглашения) */
  readonly reject = output<number>();

  ngOnInit(): void {}
}
