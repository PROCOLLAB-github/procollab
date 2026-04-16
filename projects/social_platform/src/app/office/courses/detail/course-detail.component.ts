/** @format */

import { CommonModule } from "@angular/common";
import { Component, DestroyRef, HostListener, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter, map, tap } from "rxjs";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CourseDetail, CourseLesson, CourseStructure } from "@office/models/courses.model";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { CourseAboutComponent } from "@office/courses/shared/course-about/course-about.component";
import { CoursesService } from "@office/courses/courses.service";

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
  private readonly coursesService = inject(CoursesService);

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
  protected readonly courseStructure = signal<CourseStructure | undefined>(undefined);
  protected readonly currentLesson = this.coursesService.currentLesson;

  get lessonOrder(): number | null {
    const lesson = this.currentLesson();
    const structure = this.courseStructure();
    if (!lesson || !structure) return null;

    for (const mod of structure.modules) {
      const found = mod.lessons.find(l => l.id === lesson.id);
      if (found) return found.order;
    }
    return null;
  }

  get isMobile(): boolean {
    return this.appWidth < 920;
  }

  get showCover(): boolean {
    return !this.isTaskDetail() || !this.isMobile;
  }

  get showAboutButton(): boolean {
    return this.isMobile && !this.isTaskDetail();
  }

  get showBackOnly(): boolean {
    return this.isTaskDetail() && this.isMobile;
  }

  get showAnalyticsButton(): boolean {
    return this.isMobile && !this.isTaskDetail();
  }

  get showProgramButton(): boolean {
    return !this.showBackOnly;
  }

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
        next: ([course, structure]: [CourseDetail, CourseStructure]) => {
          this.course.set(course);
          this.courseStructure.set(structure);
          this.coursesService.courseStructure.set(structure);

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
