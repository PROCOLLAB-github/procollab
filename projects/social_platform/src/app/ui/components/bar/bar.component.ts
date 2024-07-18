/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { BackComponent } from "@uilib";

@Component({
  selector: "app-bar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BackComponent],
  templateUrl: "./bar.component.html",
  styleUrl: "./bar.component.scss",
})
export class BarComponent {
  constructor() {}

  @Input() links!: {
    link: string;
    linkText: string;
    isRouterLinkActiveOptions: boolean;
    count?: number;
  }[];

  @Input() backHave?: boolean;

  @Input() ballHave?: boolean = false;
}
