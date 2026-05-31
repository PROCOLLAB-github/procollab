/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map } from "rxjs";
import { CourseDetail, CourseStructure } from "@domain/courses/courses.model";
import { CourseDetailUIInfoService } from "./ui/course-detail-ui-info.service";
import { loading, success } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Координирует детальную страницу курса, структуру модулей и навигацию к программе. */
@Injectable()
export class CourseDetailInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly courseDetailUIInfoService = inject(CourseDetailUIInfoService);

  init(): void {
    this.loadCourseData();
    this.trackNavigation();
  }

  redirectDetailInfo(courseId?: number): void {
    const url = courseId != null ? AppRoutes.courses.detail(courseId) : AppRoutes.courses.list();
    this.router.navigateByUrl(url);
  }

  redirectToProgram(): void {
    const course = this.courseDetailUIInfoService.course();
    if (!course) return;

    this.router.navigate([AppRoutes.program.detail(course.partnerProgramId)], {
      queryParams: { courseId: course.id },
    });
  }

  private loadCourseData(): void {
    this.courseDetailUIInfoService.courseDetail$.set(loading());
    this.courseDetailUIInfoService.courseStructure$.set(loading());

    this.route.data
      .pipe(
        map(data => data["data"]),
        filter(data => !!data),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(([detail, structure]: [CourseDetail | null, CourseStructure | null]) => {
        if (!detail || !structure) return;

        this.courseDetailUIInfoService.courseDetail$.set(success(detail));
        this.courseDetailUIInfoService.courseStructure$.set(success(structure));
        this.courseDetailUIInfoService.applyCourseData(structure);
      });
  }

  private trackNavigation(): void {
    this.courseDetailUIInfoService.isTaskDetail.set(this.router.url.includes("lesson"));

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.courseDetailUIInfoService.isTaskDetail.set(this.router.url.includes("lesson"));
      });
  }
}
