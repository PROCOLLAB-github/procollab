/** @format */

import { ChangeDetectionStrategy, Component, input, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { IconComponent } from "@uilib";

/** Горизонтальный список навигационных ссылок с индикаторами активности. */
@Component({
  selector: "app-bar-new",
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: "./bar.component.html",
  styleUrl: "./bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarNewComponent {
  /** Массив навигационных ссылок */
  readonly links = input.required<
    {
      link: string;
      linkText: string;
      iconName: string;
      isRouterLinkActiveOptions: boolean;
    }[]
  >();
}
