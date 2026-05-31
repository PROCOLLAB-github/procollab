/** @format */

import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { IconComponent } from "@uilib";
import { UserLinksPipe, TruncatePipe } from "@corelib";

/** Виджет ссылок программы (контакты/материалы). */
@Component({
    selector: "app-program-links",
    templateUrl: "./program-links.component.html",
    styleUrl: "./program-links.component.scss",
    imports: [IconComponent, UserLinksPipe, TruncatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramLinksComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) links!: { label: string; url: string }[];
}
