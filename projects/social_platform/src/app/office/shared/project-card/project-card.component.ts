/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Project } from "@models/project.model";
import { IndustryService } from "@services/industry.service";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-project-card",
  templateUrl: "./project-card.component.html",
  styleUrl: "./project-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, IconComponent, AsyncPipe],
})
export class ProjectCardComponent implements OnInit {
  constructor(public industryService: IndustryService) {}

  ngOnInit(): void {}

  @Input({ required: true }) project!: Project;
  @Input() canDelete?: boolean | null = false;
  @Input() isSubscribed?: boolean | null = false;
  @Input() profileId?: number;

  @Output() remove = new EventEmitter<number>();

  onBasket(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.remove.emit(this.project.id);
  }
}
