/** @format */

import { TestBed } from "@angular/core/testing";

import { AuthRequiredGuard } from "./auth-required.guard";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "../services";

describe("AuthRequiredGuard", () => {
  let guard: AuthRequiredGuard;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj("AuthService", ["getTokens"]);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }]
    });
    guard = TestBed.inject(AuthRequiredGuard);
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });
});
