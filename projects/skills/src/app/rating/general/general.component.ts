/** @format */

import { Component, inject, Input, OnInit, signal } from "@angular/core";
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
  @Input() rating!: GeneralRating[];
  protected readonly Array = Array;

  route = inject(ActivatedRoute);

  top3 = signal<GeneralRating[]>([]);
  rest = signal<GeneralRating[]>([]);

  ngOnInit() {
    this.route.data.subscribe(r => {
      this.rating = r['data'];
    })

    this.top3.set(this.rating.slice(0, 2));
    this.rest.set(this.rating.slice(2));
  }
}
