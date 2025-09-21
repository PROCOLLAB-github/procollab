/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-project-direction-card",
  templateUrl: "./project-direction-card.component.html",
  styleUrl: "./project-direction-card.component.scss",
  imports: [CommonModule, IconComponent, ModalComponent],
  standalone: true,
})
export class ProjectDirectionCard {
  @Input() direction!: string;
  @Input() icon!: string;
  @Input() about!: string;

  isShowModal = false;
}
