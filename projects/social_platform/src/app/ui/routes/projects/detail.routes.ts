/** @format */

import { Routes } from "@angular/router";
import { ProjectInfoComponent } from "../../pages/projects/detail/info/info.component";
import { ProjectInfoResolver } from "../../pages/projects/detail/info/info.resolver";
import { ProjectResponsesResolver } from "../../pages/projects/detail/work-section/responses.resolver";
import { ProjectChatComponent } from "../../pages/projects/detail/chat/chat.component";
import { ProjectTeamComponent } from "../../pages/projects/detail/team/team.component";
import { ProjectVacanciesComponent } from "../../pages/projects/detail/vacancies/vacancies.component";
import { DeatilComponent } from "@ui/components/detail/detail.component";
import { ProjectWorkSectionComponent } from "../../pages/projects/detail/work-section/work-section.component";
import { KanbanBoardResolver } from "../../pages/projects/detail/kanban/kanban.resolver";
import { KanbanBoardGuard } from "../../../../../../core/src/lib/guards/kanban/kanban.guard";
import { KanbanComponent } from "../../pages/projects/detail/kanban/kanban.component";
import { ProjectDetailResolver } from "@ui/pages/projects/detail/detail.resolver";
import { NewsDetailComponent } from "@ui/components/news-detail/news-detail.component";
import { NewsDetailResolver } from "@ui/components/news-detail/news-detail.resolver";
import { ProjectChatResolver } from "@ui/pages/projects/detail/chat/chat.resolver";

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
        loadChildren: () => import("../kanban/kanban.routes").then(c => c.KANBAN_ROUTES),
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
