/** @format */

import { Routes } from "@angular/router";
import { ChatGroupsResolver } from "@ui/pages/chat/chat-groups.resolver";
import { ChatComponent } from "@ui/pages/chat/chat.component";
import { ChatResolver } from "@ui/pages/chat/chat.resolver";

/**
 * Маршруты для модуля чатов
 * Определяет пути для прямых чатов, групповых чатов и конкретных диалогов
 *
 * Принимает:
 * - URL пути чатов
 *
 * Возвращает:
 * - Конфигурацию маршрутов с соответствующими резолверами
 */
export const CHAT_ROUTES: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "directs",
  },
  {
    path: "directs",
    component: ChatComponent,
    resolve: {
      data: ChatResolver,
    },
  },
  {
    path: "groups",
    component: ChatComponent,
    resolve: {
      data: ChatGroupsResolver,
    },
  },
  {
    path: ":chatId",
    loadChildren: () => import("../chat/chat-direct.routes").then(c => c.CHAT_DIRECT_ROUTES),
  },
];
