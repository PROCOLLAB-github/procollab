/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MonthBlockComponent } from "../shared/month-block/month-block.component";
import { SkillsBlockComponent } from "../shared/skills-block/skills-block.component";
import { ProgressBlockComponent } from "../shared/progress-block/progress-block.component";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { mockMonthsList } from "projects/core/src/consts/list-mock-months";

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [CommonModule, MonthBlockComponent, SkillsBlockComponent, ProgressBlockComponent],
  templateUrl: "./profile-home.component.html",
  styleUrl: "./profile-home.component.scss",
})
export class ProfileHomeComponent {
  route = inject(ActivatedRoute);

  profileData = toSignal(this.route.data.pipe(map(r => r["data"])));

  readonly mockMonts = mockMonthsList;
}
