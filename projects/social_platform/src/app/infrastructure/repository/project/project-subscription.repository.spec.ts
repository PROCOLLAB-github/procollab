/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ProjectSubscriptionRepository } from "./project-subscription.repository";
import { SubscriptionHttpAdapter } from "../../adapters/subscription/subscription-http.adapter";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";
import { Project } from "@domain/project/project.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("ProjectSubscriptionRepository", () => {
  let repository: ProjectSubscriptionRepository;
  let adapter: any;

  function setup(): void {
    adapter = {
      getSubscribers: vi.fn(),
      addSubscription: vi.fn(),
      getSubscriptions: vi.fn(),
      deleteSubscription: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        ProjectSubscriptionRepository,
        { provide: SubscriptionHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectSubscriptionRepository);
  }

  it("getSubscribers делегирует в adapter", () => {
    setup();
    adapter.getSubscribers.mockReturnValue(of([] as ProjectSubscriber[]));
    repository.getSubscribers(42).subscribe();
    expect(adapter.getSubscribers).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("addSubscription делегирует в adapter", () => {
    setup();
    adapter.addSubscription.mockReturnValue(of(undefined));
    repository.addSubscription(42).subscribe();
    expect(adapter.addSubscription).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("getSubscriptions делегирует в adapter (с params)", () => {
    setup();
    const params = new HttpParams();
    adapter.getSubscriptions.mockReturnValue(
      of({ count: 0, results: [], next: "", previous: "" } as ApiPagination<Project>),
    );
    repository.getSubscriptions(10, params).subscribe();
    expect(adapter.getSubscriptions).toHaveBeenCalledExactlyOnceWith(10, params);
  });

  it("deleteSubscription делегирует в adapter", () => {
    setup();
    adapter.deleteSubscription.mockReturnValue(of(undefined));
    repository.deleteSubscription(42).subscribe();
    expect(adapter.deleteSubscription).toHaveBeenCalledExactlyOnceWith(42);
  });
});
