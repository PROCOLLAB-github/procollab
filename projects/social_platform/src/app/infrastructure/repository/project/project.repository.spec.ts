/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ProjectRepository } from "./project.repository";
import { ProjectHttpAdapter } from "../../adapters/project/project-http.adapter";
import { EventBus } from "@domain/shared/event-bus";
import { Project, ProjectCount } from "@domain/project/project.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectDto } from "../../adapters/project/dto/project.dto";
import { projectCreated } from "@domain/project/events/project-created.event";
import { projectDeleted } from "@domain/project/events/project-deleted.event";
import { projectSubscribed } from "@domain/project/events/project-subscribed.event";
import { projectUnSubscribed } from "@domain/project/events/project-unsubsribed.event";
import { removeProjectCollaborator } from "@domain/project/events/remove-project-collaborator.event";
import { sendVacancyResponse } from "@domain/vacancy/events/send-vacancy-response.event";
import { acceptVacancyResponse } from "@domain/vacancy/events/accept-vacancy-response.event";
import { rejectVacancyResponse } from "@domain/vacancy/events/reject-vacancy-response.event";

describe("ProjectRepository", () => {
  let repository: ProjectRepository;
  let adapter: jasmine.SpyObj<ProjectHttpAdapter>;
  let eventBus: EventBus;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProjectHttpAdapter>("ProjectHttpAdapter", [
      "fetchAll",
      "fetchOne",
      "fetchCount",
      "putUpdate",
      "fetchMy",
      "postCreate",
      "deleteOne",
    ]);
    TestBed.configureTestingModule({
      providers: [ProjectRepository, { provide: ProjectHttpAdapter, useValue: adapter }],
    });
    eventBus = TestBed.inject(EventBus);
    repository = TestBed.inject(ProjectRepository);
  }

  const page = (): ApiPagination<ProjectDto> => ({
    count: 1,
    next: "",
    previous: "",
    results: [{ id: 1 } as ProjectDto],
  });

  it("getAll мапит results в Project", done => {
    setup();
    const params = new HttpParams();
    adapter.fetchAll.and.returnValue(of(page()));

    repository.getAll(params).subscribe(res => {
      expect(adapter.fetchAll).toHaveBeenCalledOnceWith(params);
      expect(res.results[0]).toBeInstanceOf(Project);
      done();
    });
  });

  it("getOne кеширует результат: повторный вызов не бьёт adapter", () => {
    setup();
    adapter.fetchOne.and.returnValue(of({ id: 42 } as ProjectDto));

    repository.getOne(42).subscribe();
    repository.getOne(42).subscribe();

    expect(adapter.fetchOne).toHaveBeenCalledTimes(1);
  });

  it("refreshCount мапит в ProjectCount и пушит в count$", done => {
    setup();
    adapter.fetchCount.and.returnValue(of({ my: 1, all: 2, subs: 3 } as ProjectCount));

    repository.refreshCount().subscribe(count => {
      expect(count).toBeInstanceOf(ProjectCount);
      expect(repository.count$.getValue().my).toBe(1);
      expect(repository.count$.getValue().all).toBe(2);
      expect(repository.count$.getValue().subs).toBe(3);
      done();
    });
  });

  it("update мапит ответ в Project и инвалидирует кеш", done => {
    setup();
    adapter.fetchOne.and.returnValue(of({ id: 42 } as ProjectDto));
    adapter.putUpdate.and.returnValue(of({ id: 42 } as ProjectDto));

    repository.getOne(42).subscribe();
    repository.update(42, { description: "x" }).subscribe(() => {
      // после invalidate следующий getOne должен снова пойти в adapter
      repository.getOne(42).subscribe();
      expect(adapter.fetchOne).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it("getMy мапит results в Project", done => {
    setup();
    adapter.fetchMy.and.returnValue(of(page()));
    repository.getMy().subscribe(res => {
      expect(res.results[0]).toBeInstanceOf(Project);
      done();
    });
  });

  it("postOne мапит ответ в Project", done => {
    setup();
    adapter.postCreate.and.returnValue(of({ id: 1 } as ProjectDto));
    repository.postOne().subscribe(p => {
      expect(p).toBeInstanceOf(Project);
      done();
    });
  });

  it("deleteOne делегирует в adapter", () => {
    setup();
    adapter.deleteOne.and.returnValue(of(undefined));
    repository.deleteOne(42).subscribe();
    expect(adapter.deleteOne).toHaveBeenCalledOnceWith(42);
  });

  it("ProjectCreated увеличивает count.my", () => {
    setup();
    repository.count$.next({ my: 1, all: 0, subs: 0 });
    eventBus.emit(projectCreated({ id: 1 } as Project));
    expect(repository.count$.getValue().my).toBe(2);
  });

  it("ProjectDeleted уменьшает count.my и инвалидирует кеш", () => {
    setup();
    adapter.fetchOne.and.returnValue(of({ id: 7 } as ProjectDto));
    repository.getOne(7).subscribe();
    repository.count$.next({ my: 2, all: 0, subs: 0 });

    eventBus.emit(projectDeleted(7));

    expect(repository.count$.getValue().my).toBe(1);
    repository.getOne(7).subscribe();
    expect(adapter.fetchOne).toHaveBeenCalledTimes(2);
  });

  it("ProjectSubscribed увеличивает count.subs", () => {
    setup();
    repository.count$.next({ my: 0, all: 0, subs: 1 });
    eventBus.emit(projectSubscribed(7));
    expect(repository.count$.getValue().subs).toBe(2);
  });

  it("ProjectUnSubscribed уменьшает count.subs (не ниже 0) и инвалидирует", () => {
    setup();
    repository.count$.next({ my: 0, all: 0, subs: 0 });
    eventBus.emit(projectUnSubscribed(7));
    expect(repository.count$.getValue().subs).toBe(0);
  });

  it("RemoveProjectCollaborator инвалидирует кеш проекта", () => {
    setup();
    adapter.fetchOne.and.returnValue(of({ id: 7 } as ProjectDto));
    repository.getOne(7).subscribe();
    eventBus.emit(removeProjectCollaborator(7, 42));
    repository.getOne(7).subscribe();
    expect(adapter.fetchOne).toHaveBeenCalledTimes(2);
  });

  it("SendVacancyResponse инвалидирует кеш проекта", () => {
    setup();
    adapter.fetchOne.and.returnValue(of({ id: 7 } as ProjectDto));
    repository.getOne(7).subscribe();
    eventBus.emit(sendVacancyResponse(1, 2, 7, 10, false));
    repository.getOne(7).subscribe();
    expect(adapter.fetchOne).toHaveBeenCalledTimes(2);
  });

  it("AcceptVacancyResponse инвалидирует кеш проекта", () => {
    setup();
    adapter.fetchOne.and.returnValue(of({ id: 7 } as ProjectDto));
    repository.getOne(7).subscribe();
    eventBus.emit(acceptVacancyResponse(1, 2, 7, 10));
    repository.getOne(7).subscribe();
    expect(adapter.fetchOne).toHaveBeenCalledTimes(2);
  });

  it("RejectVacancyResponse инвалидирует кеш проекта", () => {
    setup();
    adapter.fetchOne.and.returnValue(of({ id: 7 } as ProjectDto));
    repository.getOne(7).subscribe();
    eventBus.emit(rejectVacancyResponse(1, 2, 7, 10));
    repository.getOne(7).subscribe();
    expect(adapter.fetchOne).toHaveBeenCalledTimes(2);
  });
});
