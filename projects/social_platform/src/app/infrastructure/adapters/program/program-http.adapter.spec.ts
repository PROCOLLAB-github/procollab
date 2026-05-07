/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { ProgramHttpAdapter } from "./program-http.adapter";
import { Program, ProgramDataSchema } from "@domain/program/program.model";
import { ProgramCreate } from "@domain/program/program-create.model";
import { Project } from "@domain/project/project.model";
import { ProjectAdditionalFields } from "@domain/project/project-additional-fields.model";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

describe("ProgramHttpAdapter", () => {
  let adapter: ProgramHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post"]);
    TestBed.configureTestingModule({
      providers: [ProgramHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProgramHttpAdapter);
  }

  const pagination = <T>(): { count: number; results: T[]; next: string; previous: string } => ({
    count: 0,
    results: [],
    next: "",
    previous: "",
  });

  it("getAll идёт в GET /programs/ c limit/offset и дополнительными фильтрами", () => {
    setup();
    api.get.and.returnValue(of(pagination<Program>()));

    const extra = new HttpParams().set("status", "open");
    adapter.getAll(20, 10, extra).subscribe();

    const [url, params] = api.get.calls.mostRecent().args;
    expect(url).toBe("/programs/");
    expect(params?.get("limit")).toBe("10");
    expect(params?.get("offset")).toBe("20");
    expect(params?.get("status")).toBe("open");
  });

  it("getActualPrograms идёт в GET /programs/", () => {
    setup();
    api.get.and.returnValue(of(pagination<Program>()));

    adapter.getActualPrograms().subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/programs/");
  });

  it("getOne идёт в GET /programs/:id/", () => {
    setup();
    api.get.and.returnValue(of({} as Program));

    adapter.getOne(5).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/programs/5/");
  });

  it("create идёт в POST /programs/ с телом", () => {
    setup();
    api.post.and.returnValue(of({} as Program));
    const body = {} as ProgramCreate;

    adapter.create(body).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/programs/", body);
  });

  it("getDataSchema идёт в GET /programs/:id/schema/", () => {
    setup();
    api.get.and.returnValue(of({ dataSchema: {} as ProgramDataSchema }));

    adapter.getDataSchema(5).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/programs/5/schema/");
  });

  it("register идёт в POST /programs/:id/register/ c additionalData", () => {
    setup();
    api.post.and.returnValue(of({} as ProgramDataSchema));

    adapter.register(5, { foo: "bar" }).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/programs/5/register/", { foo: "bar" });
  });

  it("getAllProjects идёт в GET /programs/:id/projects", () => {
    setup();
    api.get.and.returnValue(of(pagination<Project>()));
    const params = new HttpParams().set("q", "x");

    adapter.getAllProjects(5, params).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/programs/5/projects", params);
  });

  it("getAllMembers идёт в GET /auth/public-users/ c partner_program", () => {
    setup();
    api.get.and.returnValue(of(pagination<unknown>()));

    adapter.getAllMembers(5, 20, 10).subscribe();

    const [url, params] = api.get.calls.mostRecent().args;
    expect(url).toBe("/auth/public-users/");
    expect(params?.get("partner_program")).toBe("5");
    expect(params?.get("limit")).toBe("10");
    expect(params?.get("offset")).toBe("20");
  });

  it("getProgramFilters идёт в GET /programs/:id/filters/", () => {
    setup();
    api.get.and.returnValue(of([] as PartnerProgramFields[]));

    adapter.getProgramFilters(5).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/programs/5/filters/");
  });

  it("getProgramProjectAdditionalFields идёт в GET /programs/:id/projects/apply/", () => {
    setup();
    api.get.and.returnValue(of({} as ProjectAdditionalFields));

    adapter.getProgramProjectAdditionalFields(5).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/programs/5/projects/apply/");
  });

  it("applyProjectToProgram идёт в POST /programs/:id/projects/apply/ c body", () => {
    setup();
    api.post.and.returnValue(of({}));
    const body = { projectId: 42 };

    adapter.applyProjectToProgram(5, body).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/programs/5/projects/apply/", body);
  });

  it("createProgramFilters идёт в POST /programs/:id/projects/filter/ с query и body", () => {
    setup();
    api.post.and.returnValue(of(pagination<Project>()));
    const params = new HttpParams().set("limit", "10");

    adapter.createProgramFilters(5, { status: ["open"] }, params).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/programs/5/projects/filter/?limit=10", {
      filters: { status: ["open"] },
    });
  });

  it("submitCompettetiveProject идёт в POST /programs/partner-program-projects/:id/submit/", () => {
    setup();
    api.post.and.returnValue(of({} as Project));

    adapter.submitCompettetiveProject(99).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/programs/partner-program-projects/99/submit/", {});
  });
});
