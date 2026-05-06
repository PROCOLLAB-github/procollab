/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { SubscriptionHttpAdapter } from "./subscription-http.adapter";

describe("SubscriptionHttpAdapter", () => {
  let adapter: SubscriptionHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post"]);
    TestBed.configureTestingModule({
      providers: [SubscriptionHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(SubscriptionHttpAdapter);
  }

  it("getSubscribers идёт в GET /projects/:id/subscribers/", () => {
    setup();
    api.get.and.returnValue(of([]));

    adapter.getSubscribers(42).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/42/subscribers/");
  });

  it("addSubscription идёт в POST /projects/:id/subscribe/", () => {
    setup();
    api.post.and.returnValue(of(undefined));

    adapter.addSubscription(42).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/subscribe/", {});
  });

  it("getSubscriptions идёт в GET /auth/users/:uid/subscribed_projects/", () => {
    setup();
    api.get.and.returnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.getSubscriptions(7).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/auth/users/7/subscribed_projects/", undefined);
  });

  it("deleteSubscription идёт в POST /projects/:id/unsubscribe/", () => {
    setup();
    api.post.and.returnValue(of(undefined));

    adapter.deleteSubscription(42).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/unsubscribe/", {});
  });
});
