/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-project-rating",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./project-rating.component.html",
  styleUrl: "./project-rating.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRatingComponent {}
