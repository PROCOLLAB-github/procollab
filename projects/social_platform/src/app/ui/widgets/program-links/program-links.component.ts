/** @format */

import { Component, Input } from "@angular/core";
import { IconComponent } from "@uilib";
import { UserLinksPipe } from "@core/lib/pipes/user/user-links.pipe";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";

@Component({
  selector: "app-program-links",
  templateUrl: "./program-links.component.html",
  styleUrl: "./program-links.component.scss",
  standalone: true,
  imports: [IconComponent, UserLinksPipe, TruncatePipe],
})
export class ProgramLinksComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) links!: { label: string; url: string }[];
}
