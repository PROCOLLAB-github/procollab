/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Project } from "../../models/project.model";
import { IndustryService } from "../../services/industry.service";
import { Industry } from "../../models/industry.model";
import { numWord } from "../../../utils/num-word";

@Component({
  selector: "app-project-card",
  templateUrl: "./project-card.component.html",
  styleUrls: ["./project-card.component.scss"],
})
export class ProjectCardComponent implements OnInit {
  constructor(public industryService: IndustryService) {}

  ngOnInit(): void {}

  numWord = numWord;

  @Input() project!: Project;
  @Input() basket?: boolean | null = false;

  @Output() remove = new EventEmitter<void>();

  getIndustry(industries: Industry[], industryId: number): Industry | undefined {
    return industries.find(industry => industry.id === industryId);
  }
}
