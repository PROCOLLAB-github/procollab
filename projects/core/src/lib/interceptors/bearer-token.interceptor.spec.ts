/** @format */

import { TestBed } from "@angular/core/testing";

import { BearerTokenInterceptor } from "./bearer-token.interceptor";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { TokenService } from "../services/tokens/token.service";
import { LoggerService } from "../services/logger/logger.service";

describe("BearerTokenInterceptor", () => {
  beforeEach(() => {
    const tokenServiceSpy = {
      getTokens: vi.fn(),
      refreshTokens: vi.fn(),
      clearTokens: vi.fn(),
      memTokens: vi.fn(),
      getCookieOptions: vi.fn(),
    };
    const loggerSpy = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        BearerTokenInterceptor,
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: LoggerService, useValue: loggerSpy },
      ],
    });
  });

  it("should be created", () => {
    const interceptor: BearerTokenInterceptor = TestBed.inject(BearerTokenInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
