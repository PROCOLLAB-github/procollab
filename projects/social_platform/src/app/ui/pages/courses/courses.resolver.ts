/** @format */

import { inject } from "@angular/core";
import { GetCoursesUseCase } from "@api/courses/use-cases/get-courses.use-case";
import { map } from "rxjs";

export const CoursesResolver = () => {
  const getCoursesUseCase = inject(GetCoursesUseCase);

  return getCoursesUseCase.execute().pipe(map(result => (result.ok ? result.value : [])));
};
