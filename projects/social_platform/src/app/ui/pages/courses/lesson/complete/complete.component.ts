/** @format */

import { Component, HostListener, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/primitives";
import { ActivatedRoute, Router } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";

/**
 * Компонент завершения задачи
 * Отображает результаты выполнения задачи: прогресс, статистику, баллы
 *
 * Функциональность:
 * - Показывает круговую диаграмму прогресса
 * - Отображает количество правильных ответов
 * - Показывает заработанные баллы
 * - Предоставляет навигацию к следующему заданию или в меню навыков
 */
@Component({
  selector: "app-complete",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: "./complete.component.html",
  styleUrl: "./complete.component.scss",
})
export class TaskCompleteComponent implements OnInit {
  route = inject(ActivatedRoute); // Сервис для работы с активным маршрутом
  router = inject(Router); // Сервис для навигации
  courseId = signal<number | null>(null);

  protected appWidth = window.innerWidth;

  @HostListener("window:resize")
  onResize() {
    this.appWidth = window.innerWidth;
  }

  ngOnInit(): void {
    const courseId = Number(this.route.parent?.parent?.parent?.snapshot.paramMap.get("courseId"));
    this.courseId.set(isNaN(courseId) ? null : courseId);
  }

  routeToCourses(): void {
    const id = this.courseId();
    this.router.navigateByUrl(id ? AppRoutes.courses.detail(id) : AppRoutes.courses.list());
  }
}
