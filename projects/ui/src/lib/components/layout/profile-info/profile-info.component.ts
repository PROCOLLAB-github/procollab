/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  type OnInit,
  Output,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { User } from "@domain/auth/user.model";
import { AvatarComponent } from "../../primitives/avatar/avatar.component";
import { IconComponent } from "../../primitives/icon/icon.component";

/**
 * Компонент отображения информации о профиле пользователя
 *
 * Показывает аватар, имя пользователя, статус верификации и кнопку выхода.
 * Поддерживает переход к профилю пользователя по клику.
 *
 * @example
 * \`\`\`html
 * <app-profile-info
 *   [user]="currentUser"
 *   (logout)="handleLogout()">
 * </app-profile-info>
 * \`\`\`
 */
@Component({
    selector: "app-profile-info",
    templateUrl: "./profile-info.component.html",
    styleUrl: "./profile-info.component.scss",
    imports: [RouterLink, AvatarComponent, IconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileInfoComponent implements OnInit {
  constructor(readonly router: Router) {}

  ngOnInit(): void {}

  avatarSize = window.innerWidth < 920 ? 42 : 33;

  /** Данные пользователя для отображения */
  @Input({ required: true }) user!: User;

  /** Событие выхода из системы */
  @Output() logout = new EventEmitter<void>();
}
