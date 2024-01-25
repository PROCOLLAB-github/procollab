/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { NewProjectComponent } from "@office/feed/shared/new-project/new-project.component";

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, OpenVacancyComponent, NewProjectComponent],
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
})
export class FeedComponent {}
