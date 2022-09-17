/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectDetailResolver } from "./detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "../../../auth/services";

describe("ProjectDetailResolver", () => {
  let resolver: ProjectDetailResolver;

  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    resolver = TestBed.inject(ProjectDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
