/** @format */

import { Component, Input, type OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { IconComponent } from "@ui/components";

/**
 * Компонент кнопки "Назад"
 *
 * Предоставляет функциональность навигации назад с двумя режимами:
 * 1. Переход по указанному пути (если передан параметр path)
 * 2. Возврат к предыдущей странице в истории браузера (по умолчанию)
 *
 * @example
 * \`\`\`html
 * <!-- Возврат к предыдущей странице -->
 * <app-back></app-back>
 *
 * <!-- Переход по конкретному пути -->
 * <app-back path="/dashboard"></app-back>
 * \`\`\`
 */
@Component({
  selector: "app-back",
  templateUrl: "./back.component.html",
  styleUrl: "./back.component.scss",
  standalone: true,
  imports: [IconComponent],
})
export class BackComponent implements OnInit {
  constructor(private readonly router: Router, private readonly location: Location) {}

  /** Опциональный путь для перехода (если не указан, используется history.back()) */
  @Input() path?: string;

  ngOnInit(): void {}

  /**
   * Обработчик клика по кнопке "Назад"
   *
   * Если указан path - выполняет навигацию по этому пути,
   * иначе возвращается к предыдущей странице в истории браузера
   */
  onClick(): void {
    if (this.path) {
      this.router
        .navigateByUrl(this.path)
        .then(() => console.debug("Route changed from BackComponent"));
    } else {
      this.location.back();
    }
  }
}
