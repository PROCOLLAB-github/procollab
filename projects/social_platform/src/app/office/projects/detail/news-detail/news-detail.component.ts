/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { FeedNews } from "@office/projects/models/project-news.model";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { AsyncPipe } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";

@Component({
  selector: "app-news-detail",
  templateUrl: "./news-detail.component.html",
  styleUrl: "./news-detail.component.scss",
  standalone: true,
  imports: [ModalComponent, NewsCardComponent, AsyncPipe],
})
export class NewsDetailComponent implements OnInit {
  @Input() newsItem!: Observable<FeedNews>;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) { }

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.newsItem = r['data']
    })
  }

  onOpenChange(value: boolean) {
    if (!value) {
      const projectId = this.route.parent?.snapshot.params["projectId"];
      this.router
        .navigateByUrl(`/office/projects/${projectId}`)
        .then(() => console.debug("Route changed from NewsDetailComponent"));
    }
  }
}
