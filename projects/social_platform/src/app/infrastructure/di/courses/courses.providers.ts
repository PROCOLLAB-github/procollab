/** @format */

import { Provider } from "@angular/core";
import { CoursesRepository } from "../../repository/courses/courses.repository";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { SeenModulesStoragePort } from "@domain/courses/ports/seen-modules-storage.port";
import { LocalStorageSeenModulesAdapter } from "../../adapters/courses/local-storage-seen-modules.adapter";

export const COURSES_PROVIDERS: Provider[] = [
  { provide: CoursesRepositoryPort, useExisting: CoursesRepository },
  { provide: SeenModulesStoragePort, useExisting: LocalStorageSeenModulesAdapter },
];
