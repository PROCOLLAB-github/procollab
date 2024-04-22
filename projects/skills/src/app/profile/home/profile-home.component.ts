/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoBlockComponent } from "../shared/info-block/info-block.component";
import { MonthBlockComponent } from "../shared/month-block/month-block.component";
import { SkillsBlockComponent } from "../shared/skills-block/skills-block.component";
import { ProgressBlockComponent } from "../shared/progress-block/progress-block.component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [
    CommonModule,
    InfoBlockComponent,
    MonthBlockComponent,
    SkillsBlockComponent,
    ProgressBlockComponent,
    RouterOutlet,
  ],
  templateUrl: "./profile-home.component.html",
  styleUrl: "./profile-home.component.scss",
})
export class ProfileHomeComponent {}
