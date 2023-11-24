/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectsResolver } from "./projects.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProjectsResolver", () => {
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj("authService", { getProfile: of({}) });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
