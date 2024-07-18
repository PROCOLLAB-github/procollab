/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";
import { PersonalRatingCardComponent } from "../personal-rating-card/personal-rating-card.component";

@Component({
  selector: "app-skill-chooser",
  standalone: true,
  imports: [CommonModule, PersonalRatingCardComponent, ButtonComponent, RouterLink, IconComponent],
  templateUrl: "./skill-chooser.component.html",
  styleUrl: "./skill-chooser.component.scss",
})
export class SkillChooserComponent {
  skillsList = Array;
}
