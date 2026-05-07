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
  let adapter: jasmine.SpyObj<SubscriptionHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<SubscriptionHttpAdapter>("SubscriptionHttpAdapter", [
      "getSubscribers",
      "addSubscription",
      "getSubscriptions",
      "deleteSubscription",
    ]);
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
    adapter.getSubscribers.and.returnValue(of([] as ProjectSubscriber[]));
    repository.getSubscribers(42).subscribe();
    expect(adapter.getSubscribers).toHaveBeenCalledOnceWith(42);
  });

  it("addSubscription делегирует в adapter", () => {
    setup();
    adapter.addSubscription.and.returnValue(of(undefined));
    repository.addSubscription(42).subscribe();
    expect(adapter.addSubscription).toHaveBeenCalledOnceWith(42);
  });

  it("getSubscriptions делегирует в adapter (с params)", () => {
    setup();
    const params = new HttpParams();
    adapter.getSubscriptions.and.returnValue(
      of({ count: 0, results: [], next: "", previous: "" } as ApiPagination<Project>)
    );
    repository.getSubscriptions(10, params).subscribe();
    expect(adapter.getSubscriptions).toHaveBeenCalledOnceWith(10, params);
  });

  it("deleteSubscription делегирует в adapter", () => {
    setup();
    adapter.deleteSubscription.and.returnValue(of(undefined));
    repository.deleteSubscription(42).subscribe();
    expect(adapter.deleteSubscription).toHaveBeenCalledOnceWith(42);
  });
});
