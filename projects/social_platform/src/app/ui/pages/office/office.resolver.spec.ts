/** @format */

import { TestBed } from "@angular/core/testing";

import { OfficeResolver } from "./office.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("OfficeResolver", () => {
  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthRepository, useValue: authSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      OfficeResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
