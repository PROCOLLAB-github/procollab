/** @format */

import { TestBed } from "@angular/core/testing";

import { of } from "rxjs";
import { OnboardingService } from "./onboarding.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("OnboardingService", () => {
  let service: OnboardingService;

  const authPortSpy = jasmine.createSpyObj("AuthRepositoryPort", [
    "fetchProfile",
    "fetchUserRoles",
    "fetchChangeableRoles",
  ], {
    fetchProfile: of({}),
    fetchUserRoles: of([]),
    fetchChangeableRoles: of([]),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthRepositoryPort, useValue: authPortSpy }],
    });
    service = TestBed.inject(OnboardingService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
