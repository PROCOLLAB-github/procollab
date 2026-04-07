/** @format */

import { CommonModule } from "@angular/common";
import { Component, DestroyRef, HostListener, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter, map, tap } from "rxjs";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CourseDetail, CourseStructure } from "@office/models/courses.model";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { CourseAboutComponent } from "@office/courses/shared/course-about/course-about.component";

/**
 * Компонент детального просмотра траектории
 * Отображает навигационную панель и служит контейнером для дочерних компонентов
 * Управляет состоянием выбранной траектории и ID траектории из URL
 */
@Component({
  selector: "app-course-detail",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    CourseAboutComponent,
  ],
  templateUrl: "./course-detail.component.html",
  styleUrl: "./course-detail.component.scss",
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  appWidth = window.innerWidth;

  @HostListener("window:resize")
  onResize() {
    this.appWidth = window.innerWidth;
  }

  protected readonly isTaskDetail = signal<boolean>(false);
  protected readonly isDisabled = signal<boolean>(false);
  isAboutModalOpen = false;

  protected readonly courseModules = signal<CourseStructure["modules"]>([]);
  protected readonly course = signal<CourseDetail | undefined>(undefined);

  /**
   * Инициализация компонента
   * Подписывается на параметры маршрута и данные траектории
   */
  ngOnInit(): void {
    this.route.data
      .pipe(
        map(data => data["data"]),
        filter(course => !!course),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([course, _]: [CourseDetail, CourseStructure]) => {
          this.course.set(course);

          if (!course.partnerProgramId) {
            this.isDisabled.set(true);
          }
        },
      });

    this.isTaskDetail.set(this.router.url.includes("lesson"));

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isTaskDetail.set(this.router.url.includes("lesson"));
      });
  }

  /**
   * Перенаправляет на страницу с информацией в завивисимости от listType
   */
  redirectDetailInfo(courseId?: number): void {
    if (courseId != null) {
      this.router.navigateByUrl(`/office/courses/${courseId}`);
    } else {
      this.router.navigateByUrl("/office/courses/all");
    }
  }

  redirectToProgram(): void {
    this.router.navigateByUrl(`/office/program/${this.course()?.partnerProgramId}`);
  }
}
