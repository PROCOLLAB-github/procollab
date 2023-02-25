/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsResolver } from "./projects.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";

describe("ProjectsResolver", () => {
  let resolver: ProjectsResolver;

  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    resolver = TestBed.inject(ProjectsResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
