/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";
import { CoursesListUIInfoService } from "./ui/courses-list-ui-info.service";
import { loading, success } from "@domain/shared/async-state";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад списка курсов: инициализация/очистка загрузки перечня курсов. */
@Injectable()
export class CoursesListInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesListUIInfoService = inject(CoursesListUIInfoService);

  private readonly destroyRef = inject(DestroyRef);

  init(): void {
    this.coursesListUIInfoService.courses$.set(loading());

    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(courses => {
        this.coursesListUIInfoService.courses$.set(success(courses));
      });
  }
}
