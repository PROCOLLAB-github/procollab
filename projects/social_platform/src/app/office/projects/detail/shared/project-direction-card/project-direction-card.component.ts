/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { TagComponent } from "@ui/components/tag/tag.component";

@Component({
  selector: "app-project-direction-card",
  templateUrl: "./project-direction-card.component.html",
  styleUrl: "./project-direction-card.component.scss",
  imports: [CommonModule, IconComponent, ModalComponent, TagComponent],
  standalone: true,
})
export class ProjectDirectionCard {
  @Input() direction!: string;
  @Input() icon!: string;
  @Input() about!: string | any[];
  @Input() type!: string;

  @Input() profileInfoType?: "skills" | "achievements" = "skills";

  isShowModal = false;
}
