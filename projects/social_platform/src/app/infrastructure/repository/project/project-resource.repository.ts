/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectResourceHttpAdapter } from "../../adapters/project/project-resource-http.adapter";
import { map, Observable } from "rxjs";
import { Resource, ResourceDto } from "@domain/project/resource.model";
import { plainToInstance } from "class-transformer";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";

@Injectable({ providedIn: "root" })
export class ProjectResourceRepository implements ProjectResourceRepositoryPort {
  private readonly projectResourceAdapter = inject(ProjectResourceHttpAdapter);

  createResource(id: number, params: Omit<ResourceDto, "projectId">): Observable<Resource> {
    return this.projectResourceAdapter
      .addResource(id, params)
      .pipe(map(resource => plainToInstance(Resource, resource)));
  }

  fetchAll(id: number): Observable<Resource[]> {
    return this.projectResourceAdapter
      .getResources(id)
      .pipe(map(resources => plainToInstance(Resource, resources)));
  }

  updateResource(
    projectId: number,
    resourceId: number,
    params: Omit<ResourceDto, "projectId">
  ): Observable<Resource> {
    return this.projectResourceAdapter
      .editResource(projectId, resourceId, params)
      .pipe(map(resource => plainToInstance(Resource, resource)));
  }

  deleteResource(projectId: number, resourceId: number): Observable<void> {
    return this.projectResourceAdapter.deleteResource(projectId, resourceId);
  }
}
