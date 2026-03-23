/** @format */

import { Provider } from "@angular/core";
import { CoursesRepository } from "../../repository/courses/courses.repository";
import { CoursesRepositoryPort } from "../../../domain/courses/ports/courses.repository.port";

export const COURSES_PROVIDERS: Provider[] = [
  { provide: CoursesRepositoryPort, useExisting: CoursesRepository },
];
