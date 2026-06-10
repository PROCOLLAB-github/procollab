/** @format */

import { Routes } from "@angular/router";
import { ProfileDetailResolver } from "../../pages/profile/detail/profile-detail.resolver";
import { ProfileMainComponent } from "../../pages/profile/detail/main/main.component";
import { ProfileMainResolver } from "../../pages/profile/detail/main/main.resolver";
import { DeatilComponent } from "@ui/widgets/detail/detail.component";
import { ProfileNewsComponent } from "@ui/pages/profile/detail/profile-news/profile-news.component";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";

/** Маршруты детальной страницы профиля: информация, новости, проекты. */
export const PROFILE_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: DeatilComponent,
    providers: [ProgramDetailMainUIInfoService],
    resolve: {
      data: ProfileDetailResolver,
    },
    // Без этого Angular Router не перезапускает резолвер при смене :id в SPA-навигации
    // между профилями (тот же компонент, разные params) — на экране остаются данные
    // предыдущего юзера, applyInitProfile не вызывается.
    runGuardsAndResolvers: "always",
    data: { listType: "profile" },
    children: [
      {
        path: "",
        component: ProfileMainComponent,
      },
      {
        path: "news/:newsId",
        component: ProfileNewsComponent,
        resolve: {
          data: ProfileMainResolver,
        },
      },
    ],
  },
];
