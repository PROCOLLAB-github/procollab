/** @format */

import { TestBed } from "@angular/core/testing";

import { ProfileDetailResolver } from "./profile-detail-resolver.service";

describe("DetailResolver", () => {
  let resolver: ProfileDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProfileDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
