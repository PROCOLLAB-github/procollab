/** @format */

import { TestBed } from "@angular/core/testing";

import { OfficeResolver } from "./office.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "../auth/services";

describe("OfficeResolver", () => {
  let resolver: OfficeResolver;

  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    resolver = TestBed.inject(OfficeResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
