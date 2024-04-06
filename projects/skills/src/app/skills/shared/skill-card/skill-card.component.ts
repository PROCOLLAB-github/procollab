/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";

@Component({
  selector: "app-skill-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: "./skill-card.component.html",
  styleUrl: "./skill-card.component.scss",
})
export class SkillCardComponent {}
