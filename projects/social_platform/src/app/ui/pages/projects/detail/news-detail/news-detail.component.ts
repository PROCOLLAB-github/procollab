/** @format */

import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { FeedNews } from "@domain/news/project-news.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Детальный просмотр новости проекта в модальном окне. */
@Component({
  selector: "app-news-detail",
  templateUrl: "./news-detail.component.html",
  styleUrl: "./news-detail.component.scss",
  imports: [ModalComponent, AsyncPipe, NewsCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsDetailComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  protected readonly AppRoutes = AppRoutes;

  constructor(
    private readonly route: ActivatedRoute, // Сервис для работы с активным маршрутом
    private readonly router: Router // Сервис для навигации
  ) {}

  // Observable с данными новости из резолвера
  newsItem: Observable<FeedNews> = this.route.data.pipe(map(r => r["data"]));

  ngOnInit(): void {}

  onOpenChange(value: boolean) {
    if (!value) {
      // Получаем ID проекта из родительского маршрута
      const projectId = this.route.parent?.snapshot.params["projectId"];
      // Навигируем обратно к странице проекта
      this.router
        .navigateByUrl(AppRoutes.projects.detail(projectId))
        .then(() => this.logger.debug("Route changed from NewsDetailComponent"));
    }
  }
}
