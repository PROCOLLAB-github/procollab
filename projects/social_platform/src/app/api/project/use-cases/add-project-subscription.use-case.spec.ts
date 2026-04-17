/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddProjectSubscriptionUseCase } from "./add-project-subscription.use-case";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { projectSubscribed } from "@domain/project/events/project-subscribed.event";

describe("AddProjectSubscriptionUseCase", () => {
  let useCase: AddProjectSubscriptionUseCase;
  let repo: jasmine.SpyObj<ProjectSubscriptionRepositoryPort>;
  let bus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectSubscriptionRepositoryPort>(
      "ProjectSubscriptionRepositoryPort",
      ["addSubscription"]
    );
    bus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        AddProjectSubscriptionUseCase,
        { provide: ProjectSubscriptionRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: bus },
      ],
    });
    useCase = TestBed.inject(AddProjectSubscriptionUseCase);
  }

  it("делегирует projectId в addSubscription", () => {
    setup();
    repo.addSubscription.and.returnValue(of(undefined));

    useCase.execute(7).subscribe();

    expect(repo.addSubscription).toHaveBeenCalledOnceWith(7);
  });

  it("при успехе возвращает ok<void> и эмитит projectSubscribed", done => {
    setup();
    repo.addSubscription.and.returnValue(of(undefined));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBeTrue();
      expect(bus.emit).toHaveBeenCalledOnceWith(projectSubscribed(7));
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'add_project_subscription_error' } и не эмитит", done => {
    setup();
    const err = new Error("boom");
    repo.addSubscription.and.returnValue(throwError(() => err));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("add_project_subscription_error");
        expect(result.error.cause).toBe(err);
      }
      expect(bus.emit).not.toHaveBeenCalled();
      done();
    });
  });
});
