/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectResourceRepository } from "./project-resource.repository";
import { ProjectResourceHttpAdapter } from "../../adapters/project/project-resource-http.adapter";
import { Resource, ResourceDto } from "@domain/project/resource.model";

describe("ProjectResourceRepository", () => {
  let repository: ProjectResourceRepository;
  let adapter: any;

  function setup(): void {
    adapter = {
      addResource: vi.fn(),
      getResources: vi.fn(),
      editResource: vi.fn(),
      deleteResource: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        ProjectResourceRepository,
        { provide: ProjectResourceHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectResourceRepository);
  }

  it("createResource мапит ответ в Resource", () =>
    new Promise<void>(done => {
      setup();
      const params = {} as Omit<ResourceDto, "projectId">;
      adapter.addResource.mockReturnValue(of({ id: 1 } as Resource));

      repository.createResource(42, params).subscribe(res => {
        expect(adapter.addResource).toHaveBeenCalledExactlyOnceWith(42, params);
        expect(res).toBeInstanceOf(Resource);
        done();
      });
    }));

  it("fetchAll мапит ответ в Resource[]", () =>
    new Promise<void>(done => {
      setup();
      adapter.getResources.mockReturnValue(of([{ id: 1 }] as Resource[]));

      repository.fetchAll(42).subscribe(res => {
        expect(adapter.getResources).toHaveBeenCalledExactlyOnceWith(42);
        expect(res[0]).toBeInstanceOf(Resource);
        done();
      });
    }));

  it("updateResource мапит ответ в Resource", () =>
    new Promise<void>(done => {
      setup();
      const params = {} as Omit<ResourceDto, "projectId">;
      adapter.editResource.mockReturnValue(of({ id: 1 } as Resource));

      repository.updateResource(42, 9, params).subscribe(res => {
        expect(adapter.editResource).toHaveBeenCalledExactlyOnceWith(42, 9, params);
        expect(res).toBeInstanceOf(Resource);
        done();
      });
    }));

  it("deleteResource делегирует в adapter", () => {
    setup();
    adapter.deleteResource.mockReturnValue(of(undefined));
    repository.deleteResource(42, 9).subscribe();
    expect(adapter.deleteResource).toHaveBeenCalledExactlyOnceWith(42, 9);
  });
});
