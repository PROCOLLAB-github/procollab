/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconComponent } from "@uilib";
import { UserLinksPipe, TruncatePipe } from "@corelib";

/** Виджет ссылок программы (контакты/материалы). */
@Component({
  selector: "app-program-links",
  templateUrl: "./program-links.component.html",
  styleUrl: "./program-links.component.scss",
  imports: [IconComponent, UserLinksPipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramLinksComponent {
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
  readonly links = input.required<{ label: string; url: string }[]>();
}
