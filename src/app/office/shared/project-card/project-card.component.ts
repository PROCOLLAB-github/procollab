/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Project } from "@models/project.model";
import { IndustryService } from "@services/industry.service";
import { pluralize } from "@utils/pluralize";

@Component({
  selector: "app-project-card",
  templateUrl: "./project-card.component.html",
  styleUrls: ["./project-card.component.scss"],
})
export class ProjectCardComponent implements OnInit {
  constructor(public industryService: IndustryService) {}

  ngOnInit(): void {}

  numWord = pluralize;

  @Input() project!: Project;
  @Input() canDelete?: boolean | null = false;

  @Output() remove = new EventEmitter<number>();

  onBasket(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.remove.emit(this.project.id);
  }
}
