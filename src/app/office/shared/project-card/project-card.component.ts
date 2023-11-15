/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Project } from "@models/project.model";
import { IndustryService } from "@services/industry.service";

@Component({
  selector: "app-project-card",
  templateUrl: "./project-card.component.html",
  styleUrls: ["./project-card.component.scss"],
})
export class ProjectCardComponent implements OnInit {
  constructor(public industryService: IndustryService) {}

  ngOnInit(): void {}

  @Input() project!: Project;
  @Input() canDelete?: boolean | null = false;
  @Input() profileId?: number;

  @Output() remove = new EventEmitter<number>();

  onBasket(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.remove.emit(this.project.id);
  }
}
