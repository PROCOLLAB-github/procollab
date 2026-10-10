/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../../ui/src/lib/services/desktop-layout.service";

import { DesktopLayoutService, StateComponent } from "@uilib";

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { CourseComponent } from "./course/course.component";
import { LoaderComponent } from "@ui/primitives/loader/loader.component";
import { CoursesListInfoService } from "@api/courses/facades/courses-list-info.service";
import { CoursesListUIInfoService } from "@api/courses/facades/ui/courses-list-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Страница списка курсов. */
@Component({
  selector: "app-list",
  imports: [StateComponent, CommonModule, RouterModule, CourseComponent, LoaderComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  providers: [CoursesListInfoService, CoursesListUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesListComponent implements OnInit {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  protected readonly desktopLayout = inject(DesktopLayoutService).desktop;
  private readonly coursesListInfoService = inject(CoursesListInfoService);
  private readonly coursesListUIInfoService = inject(CoursesListUIInfoService);

  protected readonly coursesList = this.coursesListUIInfoService.coursesList;
  protected readonly loading = this.coursesListUIInfoService.loading;

  protected readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    this.coursesListInfoService.init();
  }
}
