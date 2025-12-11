/** @format */

import { TestBed } from "@angular/core/testing";

import { of } from "rxjs";
import { OnboardingService } from "./onboarding.service";
import { AuthService } from "../auth";

describe("OnboardingService", () => {
  let service: OnboardingService;

  const authSpy = jasmine.createSpyObj({}, { profile: of({}) });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    service = TestBed.inject(OnboardingService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
