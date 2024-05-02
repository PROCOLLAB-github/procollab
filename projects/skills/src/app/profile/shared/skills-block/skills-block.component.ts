/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";

@Component({
  selector: "app-skills-block",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: "./skills-block.component.html",
  styleUrl: "./skills-block.component.scss",
})
export class SkillsBlockComponent {}
