/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { SubscriptionHttpAdapter } from "./subscription-http.adapter";

describe("SubscriptionHttpAdapter", () => {
  let adapter: SubscriptionHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SubscriptionHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(SubscriptionHttpAdapter);
  }

  it("getSubscribers идёт в GET /projects/:id/subscribers/", () => {
    setup();
    api.get.mockReturnValue(of([]));

    adapter.getSubscribers(42).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/projects/42/subscribers/");
  });

  it("addSubscription идёт в POST /projects/:id/subscribe/", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.addSubscription(42).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/42/subscribe/", {});
  });

  it("getSubscriptions идёт в GET /auth/users/:uid/subscribed_projects/", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.getSubscriptions(7).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith(
      "/auth/users/7/subscribed_projects/",
      undefined,
    );
  });

  it("deleteSubscription идёт в POST /projects/:id/unsubscribe/", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.deleteSubscription(42).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/42/unsubscribe/", {});
  });
});
