/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { IconComponent } from "@uilib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";
import { Program } from "../../../domain/program/program.model";

@Component({
  selector: "app-program-sidebar-card",
  templateUrl: "./program-sidebar-card.component.html",
  styleUrl: "./program-sidebar-card.component.scss",
  imports: [CommonModule, IconComponent, AvatarComponent, TruncatePipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramSidebarCardComponent {
  @Input() program!: Program;
}
