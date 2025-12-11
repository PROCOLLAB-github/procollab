/** @format */

import { TestBed } from "@angular/core/testing";
import { SubscriptionService } from "./subscription.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("SubscriptionService", () => {
  let service: SubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SubscriptionService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
