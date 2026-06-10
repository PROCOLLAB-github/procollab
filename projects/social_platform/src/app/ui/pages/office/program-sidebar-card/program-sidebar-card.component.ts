/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconComponent } from "@uilib";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { TruncatePipe } from "@corelib";
import { Program } from "@domain/program/program.model";

/** Карточка программы в боковой панели офиса. */
@Component({
  selector: "app-program-sidebar-card",
  templateUrl: "./program-sidebar-card.component.html",
  styleUrl: "./program-sidebar-card.component.scss",
  imports: [CommonModule, IconComponent, AvatarComponent, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramSidebarCardComponent {
  readonly program = input.required<Program>();
}
