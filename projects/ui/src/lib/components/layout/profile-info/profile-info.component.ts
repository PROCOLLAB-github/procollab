/** @format */

import { Component, EventEmitter, Input, type OnInit, Output } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { DayjsPipe } from "projects/core";
import { AvatarComponent, IconComponent } from "@uilib";
import type { User } from "../../../models/user.model";

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
  standalone: true,
  imports: [RouterLink, AvatarComponent, IconComponent, DayjsPipe],
})
export class ProfileInfoComponent implements OnInit {
  constructor(readonly router: Router) {}

  ngOnInit(): void {}

  /** Данные пользователя для отображения */
  @Input({ required: true }) user!: User;

  /** Событие выхода из системы */
  @Output() logout = new EventEmitter<void>();
}
