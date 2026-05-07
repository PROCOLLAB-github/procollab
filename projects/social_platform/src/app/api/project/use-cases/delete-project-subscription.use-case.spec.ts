/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteProjectSubscriptionUseCase } from "./delete-project-subscription.use-case";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { projectUnSubscribed } from "@domain/project/events/project-unsubsribed.event";

describe("DeleteProjectSubscriptionUseCase", () => {
  let useCase: DeleteProjectSubscriptionUseCase;
  let repo: jasmine.SpyObj<ProjectSubscriptionRepositoryPort>;
  let bus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectSubscriptionRepositoryPort>(
      "ProjectSubscriptionRepositoryPort",
      ["deleteSubscription"]
    );
    bus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
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
    repo.deleteSubscription.and.returnValue(of(undefined));

    useCase.execute(7).subscribe();

    expect(repo.deleteSubscription).toHaveBeenCalledOnceWith(7);
  });

  it("при успехе возвращает ok<void> и эмитит projectUnSubscribed", done => {
    setup();
    repo.deleteSubscription.and.returnValue(of(undefined));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBeTrue();
      expect(bus.emit).toHaveBeenCalledOnceWith(projectUnSubscribed(7));
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'delete_project_subscription_error' } и не эмитит", done => {
    setup();
    const err = new Error("boom");
    repo.deleteSubscription.and.returnValue(throwError(() => err));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("delete_project_subscription_error");
        expect(result.error.cause).toBe(err);
      }
      expect(bus.emit).not.toHaveBeenCalled();
      done();
    });
  });
});
