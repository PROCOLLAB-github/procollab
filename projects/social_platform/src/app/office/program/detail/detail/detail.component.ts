/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { BarComponent } from "@ui/components";
import { BackComponent } from "@uilib";

/**
 * Основной компонент детальной страницы программы
 *
 * Служит контейнером для всех дочерних страниц программы:
 * - Основная информация
 * - Список проектов
 * - Список участников
 *
 * Предоставляет:
 * - Навигационные вкладки между разделами
 * - Кнопку "Назад" для возврата к списку программ
 * - Общий layout для всех дочерних компонентов
 *
 * Принимает:
 * @param {NavService} navService - Для установки заголовка навигации
 * @param {ActivatedRoute} route - Для получения параметров маршрута
 *
 * Состояние:
 * @property {number} programId - ID текущей программы из URL
 *
 * Жизненный цикл:
 * - OnInit: Устанавливает заголовок "Профиль программы" и сохраняет programId
 *
 * Навигация:
 * - RouterLinkActive для подсветки активной вкладки
 * - RouterLink для навигации между разделами
 * - RouterOutlet для отображения дочерних компонентов
 *
 * Возвращает:
 * HTML шаблон с навигацией и областью для дочерних компонентов
 */
@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [RouterOutlet, BarComponent, BackComponent],
})
export class ProgramDetailComponent implements OnInit {
  constructor(private readonly navService: NavService, private readonly route: ActivatedRoute) {}

  programId?: number;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");

    this.programId = this.route.snapshot.params["programId"];
  }
}
