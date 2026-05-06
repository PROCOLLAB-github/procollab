/** @format */

import { CommonModule } from "@angular/common";
import { Component, HostListener, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ButtonComponent } from "@ui/primitives";
import { LoaderComponent } from "@ui/primitives/loader/loader.component";
import { CourseDetailInfoService } from "@api/courses/facades/course-detail-info.service";
import { CourseDetailUIInfoService } from "@api/courses/facades/ui/course-detail-ui-info.service";
import { CourseAboutComponent } from "@ui/widgets/course-about/course-about.component";
import { LessonUIInfoService } from "@api/courses/facades/ui/lesson-ui-info.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { LessonInfoService } from "@api/courses/facades/lesson-info.service";

@Component({
  selector: "app-course-detail",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AvatarComponent,
    ButtonComponent,
    LoaderComponent,
    CourseAboutComponent,
    ModalComponent,
  ],
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

  isAboutModalOpen = false;

  protected appWidth = window.innerWidth;

  @HostListener("window:resize")
  onResize() {
    this.appWidth = window.innerWidth;
  }

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

  get isMobile(): boolean {
    return this.appWidth < 1000;
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
}
