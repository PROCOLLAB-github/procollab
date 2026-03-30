/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { CourseComponent } from "@ui/widgets/course/course.component";
import { LoaderComponent } from "@ui/primitives/loader/loader.component";
import { CoursesListInfoService } from "@api/courses/facades/courses-list-info.service";
import { CoursesListUIInfoService } from "@api/courses/facades/ui/courses-list-ui-info.service";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, RouterModule, CourseComponent, LoaderComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  providers: [CoursesListInfoService, CoursesListUIInfoService],
})
export class CoursesListComponent implements OnInit, OnDestroy {
  private readonly coursesListInfoService = inject(CoursesListInfoService);
  private readonly coursesListUIInfoService = inject(CoursesListUIInfoService);

  protected readonly coursesList = this.coursesListUIInfoService.coursesList;
  protected readonly loading = this.coursesListUIInfoService.loading;

  ngOnInit(): void {
    this.coursesListInfoService.init();
  }

  ngOnDestroy(): void {
    this.coursesListInfoService.destroy();
  }
}
