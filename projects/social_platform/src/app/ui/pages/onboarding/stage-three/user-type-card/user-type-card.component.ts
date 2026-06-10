/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Карточка выбора типа пользователя на этапе онбординга. */
@Component({
  selector: "app-user-type-card",
  templateUrl: "./user-type-card.component.html",
  styleUrl: "./user-type-card.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTypeCardComponent {
  readonly isActive = input<boolean>(false);
}
