/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { New } from "@models/article.model";

@Component({
  selector: "app-advert-card",
  templateUrl: "./advert-card.component.html",
  styleUrl: "./advert-card.component.scss",
})
export class AdvertCardComponent implements OnInit {
  constructor() {}

  @Input() advert?: New;
  @Input() layout: "vertical" | "horizontal" = "vertical";

  ngOnInit(): void {}
}
