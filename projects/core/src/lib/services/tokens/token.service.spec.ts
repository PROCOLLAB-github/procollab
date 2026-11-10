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
  it.each(["procollab.ru", "app.procollab.ru", "dev.procollab.ru"])(
    "сохраняет общий production cookie domain на %s",
    hostname => {
      const production = new TokenService(TestBed.inject(ApiService), true, {
        location: { hostname },
      } as Document);
      expect(production.getCookieOptions()).toMatchObject({
        domain: ".procollab.ru",
        secure: true,
        sameSite: "None",
        expires: expect.any(Date),
      });
    },
  );
  it.each(["championship.example.test", "procollab.ru.example.test", "otherprocollab.ru"])(
    "сохраняет и удаляет production cookies текущего host на %s",
    hostname => {
      const set = vi.spyOn(Cookies, "set").mockImplementation(() => undefined);
      const remove = vi.spyOn(Cookies, "remove").mockImplementation(() => undefined);
      try {
        const production = new TokenService(TestBed.inject(ApiService), true, {
          location: { hostname },
        } as Document);
        const options = production.getCookieOptions();
        expect(options).not.toHaveProperty("domain");
        expect(options).toMatchObject({ secure: true, sameSite: "None" });
        production.memTokens({ access: "demo-access", refresh: "demo-refresh" });
        expect(set).toHaveBeenCalledWith(
          "accessToken",
          "demo-access",
          expect.not.objectContaining({ domain: expect.anything() }),
        );
        production.clearTokens();
        expect(remove).toHaveBeenCalledWith(
          "accessToken",
          expect.not.objectContaining({ domain: expect.anything() }),
        );
        expect(remove).toHaveBeenCalledWith(
          "refreshToken",
          expect.not.objectContaining({ domain: expect.anything() }),
        );
      } finally {
        set.mockRestore();
        remove.mockRestore();
      }
    },
  );
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
