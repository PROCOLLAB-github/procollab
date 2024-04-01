/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoBlockComponent } from "../shared/info-block/info-block.component";
import { MonthBlockComponent } from "../shared/month-block/month-block.component";
import { SkillsBlockComponent } from "../shared/skills-block/skills-block.component";

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [CommonModule, InfoBlockComponent, MonthBlockComponent, SkillsBlockComponent],
  templateUrl: "./skills.component.html",
  styleUrl: "./skills.component.scss",
})
export class SkillsComponent {}
