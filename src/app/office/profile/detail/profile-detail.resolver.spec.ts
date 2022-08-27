/** @format */

import { TestBed } from "@angular/core/testing";

import { ProfileDetailResolver } from "./profile-detail.resolver";
import { AuthService } from "../../../auth/services";

describe("ProfileDetailResolver", () => {
  let resolver: ProfileDetailResolver;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj(["getUser"]);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    resolver = TestBed.inject(ProfileDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
