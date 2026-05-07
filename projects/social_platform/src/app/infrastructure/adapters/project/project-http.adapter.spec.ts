/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { ProjectHttpAdapter } from "./project-http.adapter";
import { ProjectCountDto, ProjectDto, ProjectListDto } from "./dto/project.dto";

describe("ProjectHttpAdapter", () => {
  let adapter: ProjectHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post", "put", "delete"]);
    TestBed.configureTestingModule({
      providers: [ProjectHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectHttpAdapter);
  }

  it("fetchAll идёт в GET /projects/ c переданными params", () => {
    setup();
    api.get.and.returnValue(of({} as ProjectListDto));
    const params = new HttpParams().set("limit", "10");

    adapter.fetchAll(params).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/", params);
  });

  it("fetchOne идёт в GET /projects/:id/", () => {
    setup();
    api.get.and.returnValue(of({} as ProjectDto));

    adapter.fetchOne(42).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/42/");
  });

  it("fetchCount идёт в GET /projects/count/", () => {
    setup();
    api.get.and.returnValue(of({} as ProjectCountDto));

    adapter.fetchCount().subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/count/");
  });

  it("postCreate идёт в POST /projects/ с пустым телом", () => {
    setup();
    api.post.and.returnValue(of({} as ProjectDto));

    adapter.postCreate().subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/", {});
  });

  it("putUpdate идёт в PUT /projects/:id/ c данными", () => {
    setup();
    api.put.and.returnValue(of({} as ProjectDto));
    const data: Partial<ProjectDto> = { name: "n" } as Partial<ProjectDto>;

    adapter.putUpdate(42, data).subscribe();

    expect(api.put).toHaveBeenCalledOnceWith("/projects/42/", data);
  });

  it("deleteOne идёт в DELETE /projects/:id/", () => {
    setup();
    api.delete.and.returnValue(of(undefined));

    adapter.deleteOne(42).subscribe();

    expect(api.delete).toHaveBeenCalledOnceWith("/projects/42/");
  });

  it("fetchMy идёт в GET /auth/users/projects/ c params", () => {
    setup();
    api.get.and.returnValue(of({} as ProjectListDto));
    const params = new HttpParams().set("limit", "5");

    adapter.fetchMy(params).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/auth/users/projects/", params);
  });
});
