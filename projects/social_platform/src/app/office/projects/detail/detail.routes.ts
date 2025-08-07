/** @format */

import { Routes } from "@angular/router";
import { ProjectInfoComponent } from "./info/info.component";
import { ProjectInfoResolver } from "./info/info.resolver";
import { ProjectResponsesComponent } from "./responses/responses.component";
import { ProjectResponsesResolver } from "./responses/responses.resolver";
import { ProjectDetailComponent } from "./detail.component";
import { ProjectChatComponent } from "./chat/chat.component";
import { ProjectChatResolver } from "@office/projects/detail/chat/chat.resolver";
import { ProjectDetailResolver } from "@office/projects/detail/detail.resolver";
import { NewsDetailComponent } from "@office/projects/detail/news-detail/news-detail.component";
import { NewsDetailResolver } from "@office/projects/detail/news-detail/news-detail.resolver";

/**
 * Конфигурация маршрутов для детального просмотра проекта
 *
 * Определяет:
 * - Главный маршрут с резолвером для загрузки данных проекта
 * - Дочерние маршруты для разных разделов проекта:
 *   - "" (пустой) - информация о проекте с возможностью просмотра новостей
 *   - "responses" - отклики на вакансии проекта
 *   - "chat" - чат проекта
 *
 * Каждый дочерний маршрут имеет свой резолвер для предзагрузки данных
 */
export const PROJECT_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: ProjectDetailComponent,
    resolve: {
      data: ProjectDetailResolver,
    },
    children: [
      {
        path: "",
        component: ProjectInfoComponent,
        resolve: {
          data: ProjectInfoResolver,
        },
        children: [
          {
            path: "news/:newsId",
            component: NewsDetailComponent,
            resolve: {
              data: NewsDetailResolver,
            },
          },
        ],
      },
      {
        path: "responses",
        component: ProjectResponsesComponent,
        resolve: {
          data: ProjectResponsesResolver,
        },
      },
      {
        path: "chat",
        component: ProjectChatComponent,
        resolve: {
          data: ProjectChatResolver,
        },
      },
    ],
  },
];
