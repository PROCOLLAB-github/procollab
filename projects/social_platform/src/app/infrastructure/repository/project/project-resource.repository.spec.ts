/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectResourceRepository } from "./project-resource.repository";
import { ProjectResourceHttpAdapter } from "../../adapters/project/project-resource-http.adapter";
import { Resource, ResourceDto } from "@domain/project/resource.model";

describe("ProjectResourceRepository", () => {
  let repository: ProjectResourceRepository;
  let adapter: jasmine.SpyObj<ProjectResourceHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProjectResourceHttpAdapter>("ProjectResourceHttpAdapter", [
      "addResource",
      "getResources",
      "editResource",
      "deleteResource",
    ]);
    TestBed.configureTestingModule({
      providers: [
        ProjectResourceRepository,
        { provide: ProjectResourceHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectResourceRepository);
  }

  it("createResource мапит ответ в Resource", done => {
    setup();
    const params = {} as Omit<ResourceDto, "projectId">;
    adapter.addResource.and.returnValue(of({ id: 1 } as Resource));

    repository.createResource(42, params).subscribe(res => {
      expect(adapter.addResource).toHaveBeenCalledOnceWith(42, params);
      expect(res).toBeInstanceOf(Resource);
      done();
    });
  });

  it("fetchAll мапит ответ в Resource[]", done => {
    setup();
    adapter.getResources.and.returnValue(of([{ id: 1 }] as Resource[]));

    repository.fetchAll(42).subscribe(res => {
      expect(adapter.getResources).toHaveBeenCalledOnceWith(42);
      expect(res[0]).toBeInstanceOf(Resource);
      done();
    });
  });

  it("updateResource мапит ответ в Resource", done => {
    setup();
    const params = {} as Omit<ResourceDto, "projectId">;
    adapter.editResource.and.returnValue(of({ id: 1 } as Resource));

    repository.updateResource(42, 9, params).subscribe(res => {
      expect(adapter.editResource).toHaveBeenCalledOnceWith(42, 9, params);
      expect(res).toBeInstanceOf(Resource);
      done();
    });
  });

  it("deleteResource делегирует в adapter", () => {
    setup();
    adapter.deleteResource.and.returnValue(of(undefined));
    repository.deleteResource(42, 9).subscribe();
    expect(adapter.deleteResource).toHaveBeenCalledOnceWith(42, 9);
  });
});
