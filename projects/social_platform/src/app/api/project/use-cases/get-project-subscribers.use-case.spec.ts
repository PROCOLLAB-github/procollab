/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectSubscribersUseCase } from "./get-project-subscribers.use-case";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";

describe("GetProjectSubscribersUseCase", () => {
  let useCase: GetProjectSubscribersUseCase;
  let repo: any;

  function setup(): void {
    repo = { getSubscribers: vi.fn() };
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
    repo.getSubscribers.mockReturnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.getSubscribers).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с массивом подписчиков", () =>
    new Promise<void>(done => {
      setup();
      const subs: ProjectSubscriber[] = [];
      repo.getSubscribers.mockReturnValue(of(subs));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(subs);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_subscribers_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.getSubscribers.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_subscribers_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
