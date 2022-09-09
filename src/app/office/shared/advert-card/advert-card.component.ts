/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Advert } from "../../models/article.model";

@Component({
  selector: "app-advert-card",
  templateUrl: "./advert-card.component.html",
  styleUrls: ["./advert-card.component.scss"],
})
export class AdvertCardComponent implements OnInit {
  constructor() {}

  @Input() advert?: Advert;
  @Input() layout: "vertical" | "horizontal" = "vertical";

  ngOnInit(): void {}
}
