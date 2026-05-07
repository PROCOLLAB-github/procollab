/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectResourceHttpAdapter } from "./project-resource-http.adapter";
import { Resource, ResourceDto } from "@domain/project/resource.model";

describe("ProjectResourceHttpAdapter", () => {
  let adapter: ProjectResourceHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post", "patch", "delete"]);
    TestBed.configureTestingModule({
      providers: [ProjectResourceHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectResourceHttpAdapter);
  }

  it("addResource идёт в POST /projects/:id/resources/ c projectId в body", () => {
    setup();
    api.post.and.returnValue(of({} as Resource));
    const params = { name: "n" } as unknown as Omit<ResourceDto, "projectId">;

    adapter.addResource(42, params).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/resources/", {
      projectId: 42,
      ...params,
    });
  });

  it("getResources идёт в GET /projects/:id/resources/", () => {
    setup();
    api.get.and.returnValue(of([] as Resource[]));

    adapter.getResources(42).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/42/resources/");
  });

  it("editResource идёт в PATCH /projects/:pid/resources/:rid/ c projectId в body", () => {
    setup();
    api.patch.and.returnValue(of({} as Resource));
    const params = { name: "n" } as unknown as Omit<ResourceDto, "projectId">;

    adapter.editResource(42, 9, params).subscribe();

    expect(api.patch).toHaveBeenCalledOnceWith("/projects/42/resources/9/", {
      projectId: 42,
      ...params,
    });
  });

  it("deleteResource идёт в DELETE /projects/:pid/resources/:rid/", () => {
    setup();
    api.delete.and.returnValue(of(undefined));

    adapter.deleteResource(42, 9).subscribe();

    expect(api.delete).toHaveBeenCalledOnceWith("/projects/42/resources/9/");
  });
});
