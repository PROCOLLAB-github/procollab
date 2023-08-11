/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { ProjectNews } from "@office/projects/models/project-news.model";

@Component({
  selector: "app-news-detail",
  templateUrl: "./news-detail.component.html",
  styleUrls: ["./news-detail.component.scss"],
})
export class NewsDetailComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {}

  newsItem: Observable<ProjectNews> = this.route.data.pipe(map(r => r["data"]));
  ngOnInit(): void {}

  onOpenChange(value: boolean) {
    if (!value) {
      const projectId = this.route.parent?.snapshot.params["projectId"];
      this.router
        .navigateByUrl(`/office/projects/${projectId}`)
        .then(() => console.debug("Route changed from NewsDetailComponent"));
    }
  }
}
