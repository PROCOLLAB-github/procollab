/** @format */

import { Observable } from "rxjs";
import { Resource, ResourceDto } from "../resource.model";

/**
 * Порт репозитория ресурсов проекта.
 * Реализуется в infrastructure/repository/project/project-resource.repository.ts
 */
export abstract class ProjectResourceRepositoryPort {
  abstract fetchAll(projectId: number): Observable<Resource[]>;
  abstract createResource(
    projectId: number,
    params: Omit<ResourceDto, "projectId">
  ): Observable<Resource>;
  abstract updateResource(
    projectId: number,
    resourceId: number,
    params: Omit<ResourceDto, "projectId">
  ): Observable<Resource>;
  abstract deleteResource(projectId: number, resourceId: number): Observable<void>;
}
