/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { map } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { FeedNews } from "@domain/news/project-news.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Отображает новость профиля в модальном окне. */
@Component({
  selector: "app-profile-news",
  standalone: true,
  imports: [CommonModule, ModalComponent, NewsCardComponent],
  templateUrl: "./profile-news.component.html",
  styleUrl: "./profile-news.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileNewsComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly loggerService = inject(LoggerService);
  protected readonly AppRoutes = AppRoutes;

  /** ID пользователя, извлеченный из родительского маршрута профиля */
  userId = this.route.parent?.parent?.snapshot.params["id"];

  /** Сигнал с данными отображаемой новости */
  newsItem = signal<FeedNews | null>(null);

  ngOnInit(): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (r: FeedNews) => {
          this.newsItem.set(r);
        },
        error: err => {
          this.loggerService.info(err);
        },
      });

    this.loggerService.info("", this.newsItem());
  }

  ngOnDestroy(): void {}

  onOpenChange(value: boolean): void {
    if (!value) {
      this.router
        .navigateByUrl(AppRoutes.profile.detail(this.userId))
        .then(() => this.loggerService.debug("Route changed from ProfileNewsComponent"));
    }
  }
}
