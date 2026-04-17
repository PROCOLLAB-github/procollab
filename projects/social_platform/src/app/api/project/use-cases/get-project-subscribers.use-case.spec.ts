/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectSubscribersUseCase } from "./get-project-subscribers.use-case";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";

describe("GetProjectSubscribersUseCase", () => {
  let useCase: GetProjectSubscribersUseCase;
  let repo: jasmine.SpyObj<ProjectSubscriptionRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectSubscriptionRepositoryPort>(
      "ProjectSubscriptionRepositoryPort",
      ["getSubscribers"]
    );
    TestBed.configureTestingModule({
      providers: [
        GetProjectSubscribersUseCase,
        { provide: ProjectSubscriptionRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProjectSubscribersUseCase);
  }

  it("делегирует projectId в getSubscribers", () => {
    setup();
    repo.getSubscribers.and.returnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.getSubscribers).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok с массивом подписчиков", done => {
    setup();
    const subs: ProjectSubscriber[] = [];
    repo.getSubscribers.and.returnValue(of(subs));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(subs);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_subscribers_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getSubscribers.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_subscribers_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
