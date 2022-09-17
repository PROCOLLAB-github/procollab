/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectEditResolver } from "./edit.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "../../../auth/services";

describe("ProjectEditResolver", () => {
  let resolver: ProjectEditResolver;

  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    resolver = TestBed.inject(ProjectEditResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
