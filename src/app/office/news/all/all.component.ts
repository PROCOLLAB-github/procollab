/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../../services/nav.service";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { New } from "../../models/article.model";

@Component({
  selector: "app-news",
  templateUrl: "./all.component.html",
  styleUrls: ["./all.component.scss"]
})
export class NewsAllComponent implements OnInit {
  constructor(private navService: NavService, private route: ActivatedRoute) {
  }

  adverts$: Observable<New[]> = this.route.data.pipe(map(r => r["data"]));

  ngOnInit(): void {
    this.navService.setNavTitle("Новости");
  }
}
