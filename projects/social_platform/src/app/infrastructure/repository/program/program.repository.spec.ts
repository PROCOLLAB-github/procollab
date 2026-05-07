/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ProgramRepository } from "./program.repository";
import { ProgramHttpAdapter } from "../../adapters/program/program-http.adapter";
import { Program, ProgramDataSchema } from "@domain/program/program.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { User } from "@domain/auth/user.model";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { ProjectAdditionalFields } from "@domain/project/project-additional-fields.model";
import { ProgramCreate } from "@domain/program/program-create.model";

describe("ProgramRepository", () => {
  let repository: ProgramRepository;
  let adapter: jasmine.SpyObj<ProgramHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProgramHttpAdapter>("ProgramHttpAdapter", [
      "getAll",
      "getActualPrograms",
      "getOne",
      "create",
      "getDataSchema",
      "register",
      "getAllProjects",
      "getAllMembers",
      "getProgramFilters",
      "getProgramProjectAdditionalFields",
      "applyProjectToProgram",
      "createProgramFilters",
      "submitCompettetiveProject",
    ]);
    TestBed.configureTestingModule({
      providers: [ProgramRepository, { provide: ProgramHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(ProgramRepository);
  }

  const page = <T>(): ApiPagination<T> => ({
    count: 0,
    results: [] as T[],
    next: "",
    previous: "",
  });

  it("getAll делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.getAll.and.returnValue(of(page<Program>()));
    repository.getAll(0, 10, params).subscribe();
    expect(adapter.getAll).toHaveBeenCalledOnceWith(0, 10, params);
  });

  it("getActualPrograms делегирует в adapter", () => {
    setup();
    adapter.getActualPrograms.and.returnValue(of(page<Program>()));
    repository.getActualPrograms().subscribe();
    expect(adapter.getActualPrograms).toHaveBeenCalledOnceWith();
  });

  it("getOne кеширует результат: повторный вызов не бьёт adapter", () => {
    setup();
    adapter.getOne.and.returnValue(of({ id: 42 } as Program));

    repository.getOne(42).subscribe();
    repository.getOne(42).subscribe();

    expect(adapter.getOne).toHaveBeenCalledTimes(1);
  });

  it("create делегирует в adapter", () => {
    setup();
    adapter.create.and.returnValue(of({ id: 1 } as Program));
    const data = { name: "p" } as ProgramCreate;
    repository.create(data).subscribe();
    expect(adapter.create).toHaveBeenCalledOnceWith(data);
  });

  it("getDataSchema разворачивает response.dataSchema", done => {
    setup();
    const schema = { city: { name: "Город", placeholder: "" } } as unknown as ProgramDataSchema;
    adapter.getDataSchema.and.returnValue(of({ dataSchema: schema }));

    repository.getDataSchema(1).subscribe(res => {
      expect(res).toBe(schema);
      done();
    });
  });

  it("register делегирует в adapter", () => {
    setup();
    adapter.register.and.returnValue(of({} as ProgramDataSchema));
    repository.register(1, { city: "Москва" }).subscribe();
    expect(adapter.register).toHaveBeenCalledOnceWith(1, { city: "Москва" });
  });

  it("getAllProjects делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.getAllProjects.and.returnValue(of(page<Project>()));
    repository.getAllProjects(1, params).subscribe();
    expect(adapter.getAllProjects).toHaveBeenCalledOnceWith(1, params);
  });

  it("getAllMembers делегирует в adapter", () => {
    setup();
    adapter.getAllMembers.and.returnValue(of(page<User>()));
    repository.getAllMembers(1, 0, 10).subscribe();
    expect(adapter.getAllMembers).toHaveBeenCalledOnceWith(1, 0, 10);
  });

  it("getProgramFilters делегирует в adapter", () => {
    setup();
    adapter.getProgramFilters.and.returnValue(of([] as PartnerProgramFields[]));
    repository.getProgramFilters(1).subscribe();
    expect(adapter.getProgramFilters).toHaveBeenCalledOnceWith(1);
  });

  it("getProgramProjectAdditionalFields делегирует в adapter", () => {
    setup();
    adapter.getProgramProjectAdditionalFields.and.returnValue(of({} as ProjectAdditionalFields));
    repository.getProgramProjectAdditionalFields(1).subscribe();
    expect(adapter.getProgramProjectAdditionalFields).toHaveBeenCalledOnceWith(1);
  });

  it("applyProjectToProgram делегирует в adapter", () => {
    setup();
    adapter.applyProjectToProgram.and.returnValue(of({}));
    repository.applyProjectToProgram(1, { foo: "bar" }).subscribe();
    expect(adapter.applyProjectToProgram).toHaveBeenCalledOnceWith(1, { foo: "bar" });
  });

  it("createProgramFilters делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.createProgramFilters.and.returnValue(of(page<Project>()));
    repository.createProgramFilters(1, { status: ["open"] }, params).subscribe();
    expect(adapter.createProgramFilters).toHaveBeenCalledOnceWith(1, { status: ["open"] }, params);
  });

  it("submitCompettetiveProject делегирует в adapter", () => {
    setup();
    adapter.submitCompettetiveProject.and.returnValue(of({} as Project));
    repository.submitCompettetiveProject(42).subscribe();
    expect(adapter.submitCompettetiveProject).toHaveBeenCalledOnceWith(42);
  });
});
