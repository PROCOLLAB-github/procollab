/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { Skill } from "../../../../models/skill.model";
import { PluralizePipe } from "@corelib";

@Component({
  selector: "app-skill-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent, PluralizePipe],
  templateUrl: "./skill-card.component.html",
  styleUrl: "./skill-card.component.scss",
})
export class SkillCardComponent {
  @Input({ required: true }) skill!: Skill;
  @Input() type: "personal" | "base" = "base";
}
