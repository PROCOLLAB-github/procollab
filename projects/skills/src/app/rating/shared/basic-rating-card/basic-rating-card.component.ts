/** @format */

import { Component, inject, Input, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { GeneralRating } from "../../../../models/rating.model";
import { PluralizePipe } from "@corelib";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";

@Component({
  selector: "app-basic-rating-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent, PluralizePipe],
  templateUrl: "./basic-rating-card.component.html",
  styleUrl: "./basic-rating-card.component.scss",
})
export class BasicRatingCardComponent {
  @Input({ required: true }) rating!: GeneralRating;
  @Input() ratingId!: number;

  route = inject(ActivatedRoute);
  ratingData = this.route.data.pipe(map(r => r["data"])) as Observable<GeneralRating[]>;
}
