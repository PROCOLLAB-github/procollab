/** @format */

import { TestBed } from "@angular/core/testing";

import { OfficeResolver } from "./office.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("OfficeResolver", () => {
  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      OfficeResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
