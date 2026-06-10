/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddProjectSubscriptionUseCase } from "./add-project-subscription.use-case";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { EventBus } from "@domain/shared/event-bus";

describe("AddProjectSubscriptionUseCase", () => {
  let useCase: AddProjectSubscriptionUseCase;
  let repo: any;
  let bus: any;

  function setup(): void {
    repo = { addSubscription: vi.fn() };
    bus = { emit: vi.fn() };
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
    repo.addSubscription.mockReturnValue(of(undefined));

    useCase.execute(7).subscribe();

    expect(repo.addSubscription).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("при успехе возвращает ok<void> и эмитит projectSubscribed", () =>
    new Promise<void>(done => {
      setup();
      repo.addSubscription.mockReturnValue(of(undefined));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(true);
        expect(bus.emit).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            type: "ProjectSubscribed",
            payload: { projectId: 7 },
          }),
        );
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'add_project_subscription_error' } и не эмитит", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.addSubscription.mockReturnValue(throwError(() => err));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("add_project_subscription_error");
          expect(result.error.cause).toBe(err);
        }
        expect(bus.emit).not.toHaveBeenCalled();
        done();
      });
    }));
});
