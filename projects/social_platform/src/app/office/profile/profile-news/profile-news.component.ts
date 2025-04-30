/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProfileNewsService } from "../detail/services/profile-news.service";
import { map, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { FeedNews } from "@office/projects/models/project-news.model";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";

@Component({
  selector: "app-profile-news",
  standalone: true,
  imports: [CommonModule, ModalComponent, NewsCardComponent],
  templateUrl: "./profile-news.component.html",
  styleUrl: "./profile-news.component.scss",
})
export class ProfileNewsComponent implements OnInit, OnDestroy {
  private readonly profileService = inject(ProfileNewsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  userId = this.route.parent?.parent?.snapshot.params["id"];

  newsItem = signal<FeedNews | null>(null);
  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    const profileNewsSub$ = this.route.data.pipe(map(r => r["data"])).subscribe({
      next: (r: FeedNews) => {
        this.newsItem.set(r);
      },
      error(err) {
        console.log(err);
      },
    });

    this.subscriptions$.push(profileNewsSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  onOpenChange(value: boolean): void {
    if (!value) {
      this.router
        .navigateByUrl(`/office/profile/${this.userId}`)
        .then(() => console.debug("Route changed from ProfileNewsComponent"));
    }
  }
}
