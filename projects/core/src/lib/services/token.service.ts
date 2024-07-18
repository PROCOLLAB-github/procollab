/** @format */

import { Inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { RefreshResponse } from "@auth/models/http.model";
import { plainToInstance } from "class-transformer";
import { Tokens } from "@auth/models/tokens.model";
import Cookies from "js-cookie";
import { ApiService, PRODUCTION } from "@corelib";

@Injectable({
  providedIn: "root",
})
export class TokenService {
  constructor(
    private apiService: ApiService,
    @Inject(PRODUCTION) private production: boolean,
  ) {}

  refreshTokens(): Observable<RefreshResponse> {
    return this.apiService
      .post("/api/token/refresh/", { refresh: this.getTokens()?.refresh })
      .pipe(map(json => plainToInstance(RefreshResponse, json)));
  }

  getCookieOptions() {
    if (this.production) {
      return {
        domain: ".procollab.ru",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      };
    }

    return {};
  }

  getTokens(): Tokens | null {
    const access = Cookies.get("accessToken");
    const refresh = Cookies.get("refreshToken");

    if (!access || !refresh) {
      return null;
    }

    return { access, refresh };
  }

  clearTokens(): void {
    Cookies.remove("accessToken", this.getCookieOptions());
    Cookies.remove("refreshToken", this.getCookieOptions());
  }

  memTokens(tokens: Tokens): void {
    Cookies.set("accessToken", tokens.access, this.getCookieOptions());
    Cookies.set("refreshToken", tokens.refresh, this.getCookieOptions());
  }
}
