/** @format */

import { Component, inject, type OnDestroy, type OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { map, Subscription } from "rxjs";
import { CourseComponent } from "../shared/course/course.component";
import { CourseCard } from "@office/models/courses.model";

/**
 * Компонент списка траекторий
 * Отображает список доступных траекторий с поддержкой пагинации
 * Поддерживает два режима: "all" (все траектории) и "my" (пользовательские)
 * Реализует бесконечную прокрутку для загрузки дополнительных элементов
 */
@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, RouterModule, CourseComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class CoursesListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  protected readonly coursesList = signal<CourseCard[]>([]);

  private readonly subscriptions$: Subscription[] = [];

  /**
   * Инициализация компонента
   * Определяет тип списка (all/my) и загружает начальные данные
   */
  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe(courses => {
      this.coursesList.set(courses);
    });
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach(s => s.unsubscribe());
  }
}
