/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteProjectSubscriptionUseCase } from "./delete-project-subscription.use-case";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { projectUnSubscribed } from "@domain/project/events/project-unsubsribed.event";

describe("DeleteProjectSubscriptionUseCase", () => {
  let useCase: DeleteProjectSubscriptionUseCase;
  let repo: any;
  let bus: any;

  function setup(): void {
    repo = { deleteSubscription: vi.fn() };
    bus = { emit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        DeleteProjectSubscriptionUseCase,
        { provide: ProjectSubscriptionRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: bus },
      ],
    });
    useCase = TestBed.inject(DeleteProjectSubscriptionUseCase);
  }

  it("делегирует projectId в deleteSubscription", () => {
    setup();
    repo.deleteSubscription.mockReturnValue(of(undefined));

    useCase.execute(7).subscribe();

    expect(repo.deleteSubscription).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("при успехе возвращает ok<void> и эмитит projectUnSubscribed", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteSubscription.mockReturnValue(of(undefined));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(true);
        expect(bus.emit).toHaveBeenCalledExactlyOnceWith(projectUnSubscribed(7));
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'delete_project_subscription_error' } и не эмитит", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.deleteSubscription.mockReturnValue(throwError(() => err));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("delete_project_subscription_error");
          expect(result.error.cause).toBe(err);
        }
        expect(bus.emit).not.toHaveBeenCalled();
        done();
      });
    }));
});
