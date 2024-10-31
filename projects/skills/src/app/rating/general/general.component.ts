/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TopRatingCardComponent } from "../shared/top-rating-card/top-rating-card.component";
import { BasicRatingCardComponent } from "../shared/basic-rating-card/basic-rating-card.component";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { GeneralRating } from "../../../models/rating.model";
import { SelectComponent } from "@ui/components";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-general",
  standalone: true,
  imports: [
    CommonModule,
    TopRatingCardComponent,
    BasicRatingCardComponent,
    SelectComponent,
    IconComponent,
  ],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.scss",
})
export class RatingGeneralComponent implements OnInit {
  route = inject(ActivatedRoute);
  rating = this.route.data.pipe(map(r => r["data"])) as Observable<GeneralRating[]>;

  top3 = signal<GeneralRating[]>([]);
  rest = signal<GeneralRating[]>([]);

  filterParams = [
    {
      label: "Месяц",
      id: 0,
      value: "last_month",
    },
    {
      label: "Год",
      id: 1,
      value: "last_year",
    },
    {
      label: "День",
      id: 2,
      value: "last_day",
    },
  ];

  ngOnInit() {
    this.rating.subscribe(r => {
      this.top3.set(r.slice(0, 3));
      this.rest.set(r.slice(3));
    });
  }
}
