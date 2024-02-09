/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { NewProjectComponent } from "@office/feed/shared/new-project/new-project.component";
import { ClosedVacancyComponent } from "@office/feed/shared/closed-vacancy/closed-vacancy.component";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, OpenVacancyComponent, NewProjectComponent, ClosedVacancyComponent],
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
})
export class FeedComponent implements OnInit {
  route = inject(ActivatedRoute);

  ngOnInit() {}
}
