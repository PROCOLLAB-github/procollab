/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { ProjectHttpAdapter } from "./project-http.adapter";
import { ProjectCountDto, ProjectDto, ProjectListDto } from "./dto/project.dto";

describe("ProjectHttpAdapter", () => {
  let adapter: ProjectHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectHttpAdapter);
  }

  it("fetchAll идёт в GET /projects/ c переданными params", () => {
    setup();
    api.get.mockReturnValue(of({} as ProjectListDto));
    const params = new HttpParams().set("limit", "10");

    adapter.fetchAll(params).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/projects/", params);
  });

  it("fetchOne идёт в GET /projects/:id/", () => {
    setup();
    api.get.mockReturnValue(of({} as ProjectDto));

    adapter.fetchOne(42).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/projects/42/");
  });

  it("fetchCount идёт в GET /projects/count/", () => {
    setup();
    api.get.mockReturnValue(of({} as ProjectCountDto));

    adapter.fetchCount().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/projects/count/");
  });

  it("postCreate идёт в POST /projects/ с пустым телом", () => {
    setup();
    api.post.mockReturnValue(of({} as ProjectDto));

    adapter.postCreate().subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/", {});
  });

  it("putUpdate идёт в PUT /projects/:id/ c данными", () => {
    setup();
    api.put.mockReturnValue(of({} as ProjectDto));
    const data: Partial<ProjectDto> = { name: "n" } as Partial<ProjectDto>;

    adapter.putUpdate(42, data).subscribe();

    expect(api.put).toHaveBeenCalledExactlyOnceWith("/projects/42/", data);
  });

  it("deleteOne идёт в DELETE /projects/:id/", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.deleteOne(42).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/projects/42/");
  });

  it("fetchMy идёт в GET /auth/users/projects/ c params", () => {
    setup();
    api.get.mockReturnValue(of({} as ProjectListDto));
    const params = new HttpParams().set("limit", "5");

    adapter.fetchMy(params).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/projects/", params);
  });
});
