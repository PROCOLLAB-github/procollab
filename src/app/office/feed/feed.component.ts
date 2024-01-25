/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, OpenVacancyComponent],
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
})
export class FeedComponent {}
