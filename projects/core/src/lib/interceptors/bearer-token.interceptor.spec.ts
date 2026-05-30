/** @format */

import { TestBed } from "@angular/core/testing";

import { BearerTokenInterceptor } from "./bearer-token.interceptor";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

describe("BearerTokenInterceptor", () => {
  beforeEach(() => {
    // SUT зависит от TokenService и LoggerService (providedIn: "root") и Router
    // (даёт RouterTestingModule). AuthService удалён при миграции на TokenService.
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [BearerTokenInterceptor],
    });
  });

  it("should be created", () => {
    const interceptor: BearerTokenInterceptor = TestBed.inject(BearerTokenInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
