/** @format */

import { ChangeDetectionStrategy, Component, HostListener, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ButtonComponent } from "@ui/primitives";
import { SoonCardComponent } from "@ui/primitives/soon-card/soon-card.component";
import { CourseModuleCardComponent } from "./course-module-card/course-module-card.component";
import { CourseDetailUIInfoService } from "@api/courses/facades/ui/course-detail-ui-info.service";
import { CourseAboutComponent } from "@ui/widgets/course-about/course-about.component";

/** Информационная вкладка курса с описанием, модулями и about-модалкой. */
@Component({
  selector: "app-detail",
  imports: [
    RouterModule,
    CommonModule,
    SoonCardComponent,
    ModalComponent,
    ButtonComponent,
    CourseModuleCardComponent,
    CourseAboutComponent,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseInfoComponent {
  protected appWidth = window.innerWidth;

  @HostListener("window:resize")
  onResize() {
    this.appWidth = window.innerWidth;
  }

  private readonly courseDetailUIInfoService = inject(CourseDetailUIInfoService);

  protected readonly courseStructure = this.courseDetailUIInfoService.courseStructure;
  protected readonly courseDetail = this.courseDetailUIInfoService.course;
  protected readonly courseModules = this.courseDetailUIInfoService.courseModules;
  protected readonly isCompleteModule = this.courseDetailUIInfoService.isCompleteModule;
  protected readonly isCourseCompleted = this.courseDetailUIInfoService.isCourseCompleted;
}
