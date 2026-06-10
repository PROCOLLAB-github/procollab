/** @format */

import { Routes } from "@angular/router";
import { ChatDirectComponent } from "@ui/pages/chat/chat-direct/chat-direct.component";
import { ChatDirectResolver } from "@ui/pages/chat/chat-direct/chat-direct.resolver";

/** Конфигурация маршрутов для модуля прямого чата. */
export const CHAT_DIRECT_ROUTES: Routes = [
  {
    // Корневой маршрут модуля - отображает компонент прямого чата
    path: "",
    component: ChatDirectComponent,
    resolve: {
      data: ChatDirectResolver, // Предварительно загружает данные чата
    },
  },
];
