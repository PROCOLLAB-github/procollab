/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ButtonComponent } from "@ui/primitives";
import { LoaderComponent } from "@ui/primitives/loader/loader.component";
import { CourseDetailInfoService } from "@api/courses/facades/course-detail-info.service";
import { CourseDetailUIInfoService } from "@api/courses/facades/ui/course-detail-ui-info.service";

@Component({
  selector: "app-course-detail",
  standalone: true,
  imports: [CommonModule, RouterOutlet, AvatarComponent, ButtonComponent, LoaderComponent],
  templateUrl: "./course-detail.component.html",
  styleUrl: "./course-detail.component.scss",
  providers: [CourseDetailInfoService, CourseDetailUIInfoService],
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  private readonly courseDetailInfoService = inject(CourseDetailInfoService);
  private readonly courseDetailUIInfoService = inject(CourseDetailUIInfoService);

  protected readonly loading = this.courseDetailUIInfoService.loading;
  protected readonly course = this.courseDetailUIInfoService.course;
  protected readonly courseModules = this.courseDetailUIInfoService.courseModules;
  protected readonly isDisabled = this.courseDetailUIInfoService.isDisabled;
  protected readonly isTaskDetail = this.courseDetailUIInfoService.isTaskDetail;

  ngOnInit(): void {
    this.courseDetailInfoService.init();
  }

  ngOnDestroy(): void {
    this.courseDetailInfoService.destroy();
  }

  redirectDetailInfo(courseId?: number): void {
    this.courseDetailInfoService.redirectDetailInfo(courseId);
  }

  redirectToProgram(): void {
    this.courseDetailInfoService.redirectToProgram();
  }
}
