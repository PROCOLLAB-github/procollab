/** @format */

import { JsonPipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IconComponent } from "@ui/components";
import { LinkTransformPipe } from "projects/core/src/lib/pipes/link-transform.pipe";

@Component({
  selector: "app-link-card",
  templateUrl: "./link-card.component.html",
  styleUrl: "./link-card.component.scss",
  standalone: true,
  imports: [IconComponent, JsonPipe, LinkTransformPipe],
})
export class LinkCardComponent {
  constructor() {}

  @Input() data?: any;
  @Input() type: "link" | "achievement" = "link";
  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.data?.id);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.edit.emit(this.data?.id);
  }
}
