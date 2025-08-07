/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { Program } from "@office/program/models/program.model";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AuthService } from "@auth/services";
import { map } from "rxjs";
import { AsyncPipe } from "@angular/common";

/**
 * Компонент заголовка программы
 *
 * Отображает основную информацию о программе в верхней части страницы:
 * - Название и описание программы
 * - Кнопки действий (в зависимости от прав пользователя)
 * - Поле поиска (для списка проектов)
 * - Специальные кнопки для экспертов
 *
 * Принимает:
 * @Input program: Program - Объект программы для отображения
 *
 * Зависимости:
 * @param {Router} router - Для навигации и определения текущего URL
 * @param {ActivatedRoute} route - Для работы с параметрами маршрута
 * @param {AuthService} authService - Для получения информации о текущем пользователе
 *
 * Свойства:
 * @property {Observable<boolean>} isUserExpert - Является ли пользователь экспертом
 * @property {boolean} isProjectsList - Находимся ли на странице списка проектов
 * @property {string} searchValue - Текущее значение поиска из URL параметров
 *
 * Возвращает:
 * HTML шаблон с заголовком программы и элементами управления
 */
@Component({
  selector: "app-program-head",
  templateUrl: "./program-head.component.html",
  styleUrl: "./program-head.component.scss",
  standalone: true,
  imports: [IconComponent, ButtonComponent, RouterLink, AsyncPipe],
})
export class ProgramHeadComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  @Input({ required: true }) program!: Program;

  isUserExpert = this.authService.profile.pipe(map(user => !!user.expert));

  isProjectsList = this.router.url.includes("projects");

  ngOnInit(): void {}

  get searchValue(): string {
    return this.route.snapshot.queryParams["q"];
  }

  set searchValue(value: string) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: value } });
  }
}
