/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";

@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrls: ["./news.component.scss"],
})
export class NewsComponent implements OnInit {
  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Новости");
  }
}
