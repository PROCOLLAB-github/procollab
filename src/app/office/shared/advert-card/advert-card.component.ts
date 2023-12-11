/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { New } from "@models/article.model";
import { NgIf, NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-advert-card",
  templateUrl: "./advert-card.component.html",
  styleUrl: "./advert-card.component.scss",
  standalone: true,
  imports: [NgIf, NgOptimizedImage],
})
export class AdvertCardComponent implements OnInit {
  constructor() {}

  @Input() advert?: New;
  @Input() layout: "vertical" | "horizontal" = "vertical";

  ngOnInit(): void {}
}
