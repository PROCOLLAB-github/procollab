/** @format */

import { Routes } from "@angular/router";
import { ProjectInfoComponent } from "./info/info.component";
import { ProjectInfoResolver } from "./info/info.resolver";
import { ProjectResponsesResolver } from "./work-section/responses.resolver";
import { ProjectChatComponent } from "./chat/chat.component";
import { ProjectChatResolver } from "@office/projects/detail/chat/chat.resolver";
import { ProjectDetailResolver } from "@office/projects/detail/detail.resolver";
import { NewsDetailComponent } from "@office/projects/detail/news-detail/news-detail.component";
import { NewsDetailResolver } from "@office/projects/detail/news-detail/news-detail.resolver";
import { ProjectTeamComponent } from "./team/team.component";
import { ProjectVacanciesComponent } from "./vacancies/vacancies.component";
import { DeatilComponent } from "@office/features/detail/detail.component";
import { ProjectWorkSectionComponent } from "./work-section/work-section.component";
import { KanbanBoardResolver } from "./kanban/kanban.resolver";
import { KanbanBoardGuard } from "./kanban/kanban.guard";
import { KanbanComponent } from "./kanban/kanban.component";

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
    component: DeatilComponent,
    resolve: {
      data: ProjectDetailResolver,
    },
    data: { listType: "project" },
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
        path: "vacancies",
        component: ProjectVacanciesComponent,
      },
      {
        path: "team",
        component: ProjectTeamComponent,
      },
      {
        path: "work-section",
        component: ProjectWorkSectionComponent,
        resolve: {
          data: ProjectResponsesResolver,
        },
      },
      {
        path: "kanban",
        canActivate: [KanbanBoardGuard],
        component: KanbanComponent,
        resolve: { data: KanbanBoardResolver },
        loadChildren: () => import("./kanban/kanban.routes").then(c => c.KANBAN_ROUTES),
        runGuardsAndResolvers: "always",
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
