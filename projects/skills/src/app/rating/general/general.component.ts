/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TopRatingCardComponent } from "../shared/top-rating-card/top-rating-card.component";
import { BasicRatingCardComponent } from "../shared/basic-rating-card/basic-rating-card.component";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable, tap } from "rxjs";
import { GeneralRating } from "../../../models/rating.model";
import { SelectComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RatingService } from "../services/rating.service";

@Component({
  selector: "app-general",
  standalone: true,
  imports: [
    CommonModule,
    TopRatingCardComponent,
    BasicRatingCardComponent,
    SelectComponent,
    IconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.scss",
})
export class RatingGeneralComponent implements OnInit {
  constructor() {
    this.ratingForm = this.fb.group({
      filterParam: ["last_month"],
    });
  }

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ratingService = inject(RatingService);

  private readonly fb = inject(FormBuilder);
  private readonly rating = this.route.data.pipe(map(r => r["data"])) as Observable<
    GeneralRating[]
  >;

  top3 = signal<GeneralRating[]>([]);
  rest = signal<GeneralRating[]>([]);

  ratingForm: FormGroup;

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
    this.loadInitialRatings();
    this.setupFormValueChanges();
  }

  loadInitialRatings() {
    this.rating.subscribe(r => {
      this.updateRatingSignals(r);
      this.navigateWithFilterParam(this.ratingForm.get("filterParam")?.value);
    });
  }

  setupFormValueChanges() {
    this.ratingForm.valueChanges.subscribe(value => {
      this.navigateWithFilterParam(value.filterParam);
      this.loadRatings(value.filterParam);
    });
  }

  navigateWithFilterParam(filterParam: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filterParam },
    });
  }

  loadRatings(filterParam: "last_month" | "last_year" | "last_day") {
    this.ratingService.getGeneralRating(filterParam).subscribe(r => {
      this.updateRatingSignals(r);
    });
  }

  updateRatingSignals(r: GeneralRating[]) {
    this.top3.set(r.slice(0, 3));
    this.rest.set(r.slice(3));
  }
}
