/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { GetProjectSubscriptionsUseCase } from "./get-project-subscriptions.use-case";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";

describe("GetProjectSubscriptionsUseCase", () => {
  let useCase: GetProjectSubscriptionsUseCase;
  let repo: jasmine.SpyObj<ProjectSubscriptionRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectSubscriptionRepositoryPort>(
      "ProjectSubscriptionRepositoryPort",
      ["getSubscriptions"]
    );
    TestBed.configureTestingModule({
      providers: [
        GetProjectSubscriptionsUseCase,
        { provide: ProjectSubscriptionRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProjectSubscriptionsUseCase);
  }

  const page: ApiPagination<Project> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (userId, params) в getSubscriptions", () => {
    setup();
    repo.getSubscriptions.and.returnValue(of(page));
    const params = new HttpParams();

    useCase.execute(5, params).subscribe();

    expect(repo.getSubscriptions).toHaveBeenCalledOnceWith(5, params);
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.getSubscriptions.and.returnValue(of(page));

    useCase.execute(5).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_subscriptions_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getSubscriptions.and.returnValue(throwError(() => err));

    useCase.execute(5).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_subscriptions_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
