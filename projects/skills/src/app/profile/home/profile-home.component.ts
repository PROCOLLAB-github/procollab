/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoBlockComponent } from "../shared/info-block/info-block.component";
import { MonthBlockComponent } from "../shared/month-block/month-block.component";
import { SkillsBlockComponent } from "../shared/skills-block/skills-block.component";
import { ProgressBlockComponent } from "../shared/progress-block/progress-block.component";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [
    CommonModule,
    MonthBlockComponent,
    SkillsBlockComponent,
    ProgressBlockComponent,
    RouterOutlet,
  ],
  templateUrl: "./profile-home.component.html",
  styleUrl: "./profile-home.component.scss",
})
export class ProfileHomeComponent {
  route = inject(ActivatedRoute);

  profileData = toSignal(this.route.data.pipe(map(r => r["data"])));

  mockMonts = [
    {
      month: "Ферваль",
      successfullyDone: true,
      year: 2025,
    },
    {
      month: "Март",
      successfullyDone: true,
      year: 2025,
    },
    {
      month: "Апрель",
      successfullyDone: false,
      year: 2025,
    },
    {
      month: "Май",
      successfullyDone: false,
      year: 2025,
    },
    {
      month: "Июнь",
      successfullyDone: false,
      year: 2025,
    },
    {
      month: "Июль",
      successfullyDone: false,
      year: 2025,
    },
  ];
}
