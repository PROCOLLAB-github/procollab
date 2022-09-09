/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, pluck } from "rxjs";
import { Advert } from "../../models/article.model";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class NewsDetailComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  advert$: Observable<Advert> = this.route.data.pipe(pluck("data"));

  ngOnInit(): void {}
}
