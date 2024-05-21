/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../shared/circle-progress-bar/circle-progress-bar.component";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { TaskResults } from "../../../models/skill.model";

@Component({
  selector: "app-complete",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent, IconComponent, ButtonComponent],
  templateUrl: "./complete.component.html",
  styleUrl: "./complete.component.scss",
})
export class TaskCompleteComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);

  results = this.route.data.pipe(map(r => r["data"])) as Observable<TaskResults>;
}
