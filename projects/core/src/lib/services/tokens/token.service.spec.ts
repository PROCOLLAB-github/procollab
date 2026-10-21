/** @format */

import { TestBed } from "@angular/core/testing";

import { TokenService } from "./token.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL, PRODUCTION } from "../../providers";
import { ApiService } from "../api/api.service";
import Cookies from "js-cookie";

describe("TokenService", () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TokenService,
        ApiService,
        { provide: API_URL, useValue: "" },
        { provide: PRODUCTION, useValue: false },
      ],
    });
    service = TestBed.inject(TokenService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
  it("выход на dev очищает только dev-сессию, сохраняя production cookies", () => {
    const keys = ["devAccessToken", "devRefreshToken", "accessToken", "refreshToken"];
    try {
      for (const key of keys) Cookies.set(key, "test-" + key);
      expect(service.getTokens()).toEqual({
        access: "test-devAccessToken",
        refresh: "test-devRefreshToken",
      });
      service.clearTokens();
      expect(service.getTokens()).toBeNull();
      expect(Cookies.get("accessToken")).toBe("test-accessToken");
      expect(Cookies.get("refreshToken")).toBe("test-refreshToken");
    } finally {
      for (const key of keys) Cookies.remove(key);
    }
  });
});
