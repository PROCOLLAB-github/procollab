/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoBlockComponent } from "../shared/info-block/info-block.component";

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [CommonModule, InfoBlockComponent],
  templateUrl: "./skills.component.html",
  styleUrl: "./skills.component.scss",
})
export class SkillsComponent {}
