/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { Advert } from "../../models/article.model";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class NewsDetailComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  advert$: Observable<Advert> = this.route.data.pipe(map(r => r["data"]));

  ngOnInit(): void {}
}
