/** @format */

import { TestBed } from "@angular/core/testing";

import { BearerTokenInterceptor } from "./bearer-token.interceptor";
import { AuthService } from "@auth/services";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

describe("BearerTokenInterceptor", () => {
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj("AuthService", [
      "getTokens",
      "memTokens",
      "refreshTokens",
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [BearerTokenInterceptor, { provide: AuthService, useValue: authSpy }],
    });
  });

  it("should be created", () => {
    const interceptor: BearerTokenInterceptor = TestBed.inject(BearerTokenInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
