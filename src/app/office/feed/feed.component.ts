/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FeedFilterComponent } from "./filter/feed-filter.component";

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, FeedFilterComponent],
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
})
export class FeedComponent {}
