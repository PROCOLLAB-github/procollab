/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Subject, takeUntil } from "rxjs";
import { CoursesListUIInfoService } from "./ui/courses-list-ui-info.service";
import { loading, success } from "@domain/shared/async-state";

@Injectable()
export class CoursesListInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesListUIInfoService = inject(CoursesListUIInfoService);

  private readonly destroy$ = new Subject<void>();

  init(): void {
    this.coursesListUIInfoService.courses$.set(loading());

    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe(courses => {
        this.coursesListUIInfoService.courses$.set(success(courses));
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
