/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramRegisterResolver } from "./register.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

describe("RegisterResolver", () => {
  let resolver: ProgramRegisterResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    resolver = TestBed.inject(ProgramRegisterResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
