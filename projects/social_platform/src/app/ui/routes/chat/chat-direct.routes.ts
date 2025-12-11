/** @format */

import { Routes } from "@angular/router";
import { ChatDirectComponent } from "@ui/pages/chat/chat-direct/chat-direct.component";
import { ChatDirectResolver } from "@ui/pages/chat/chat-direct/chat-direct.resolver";

/**
 * Конфигурация маршрутов для модуля прямого чата
 *
 * Определяет маршрут для отображения конкретного прямого чата
 * с предварительной загрузкой данных через ChatDirectResolver
 *
 * @type {Routes} Массив конфигураций маршрутов Angular
 */
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
