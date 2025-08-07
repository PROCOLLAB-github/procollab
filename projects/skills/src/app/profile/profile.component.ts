/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { InfoBlockComponent } from "./shared/info-block/info-block.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { BarComponent } from "@ui/components";

/**
 * Основной компонент профиля пользователя
 *
 * Служит контейнером для всех разделов профиля и предоставляет
 * общие данные профиля для дочерних компонентов через router-outlet.
 *
 * Компонент загружает данные профиля через резолвер и делает их
 * доступными для всех дочерних маршрутов профиля.
 */
@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, RouterOutlet, InfoBlockComponent, BarComponent],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
  // Внедрение сервиса для работы с маршрутами
  route = inject(ActivatedRoute);

  /**
   * Данные профиля пользователя
   *
   * Получаются из резолвера маршрута и содержат:
   * - Основную информацию о пользователе
   * - Список навыков с прогрессом
   * - Историю месячной активности
   */
  profileData = toSignal(this.route.data.pipe(map(r => r["data"])));
}
