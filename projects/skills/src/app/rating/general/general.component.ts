/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TopRatingCardComponent } from "../shared/top-rating-card/top-rating-card.component";
import { BasicRatingCardComponent } from "../shared/basic-rating-card/basic-rating-card.component";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { GeneralRating } from "../../../models/rating.model";

@Component({
  selector: "app-general",
  standalone: true,
  imports: [CommonModule, TopRatingCardComponent, BasicRatingCardComponent],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.scss",
})
export class RatingGeneralComponent implements OnInit {
  protected readonly Array = Array;

  route = inject(ActivatedRoute);
  rating = this.route.data.pipe(map(r => r["data"])) as Observable<GeneralRating[]>;

  top3 = signal<GeneralRating[]>([]);
  rest = signal<GeneralRating[]>([]);

  ngOnInit() {
    this.rating.subscribe(r => {
      this.top3.set(r.slice(0, 2));
      this.rest.set(r.slice(2));
    });
  }
}
