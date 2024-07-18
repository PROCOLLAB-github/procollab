/** @format */

import { Component } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { PersonalRatingCardComponent } from "../personal-rating-card/personal-rating-card.component";
import { IconComponent } from "@uilib";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-skills-block",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    PersonalRatingCardComponent,
    NgOptimizedImage,
    IconComponent,
    RouterLink,
  ],
  templateUrl: "./skills-block.component.html",
  styleUrl: "./skills-block.component.scss",
})
export class SkillsBlockComponent {
  skillsList = Array;
}
