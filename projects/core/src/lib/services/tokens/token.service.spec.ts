/** @format */

import { TestBed } from "@angular/core/testing";

import { TokenService } from "./token.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL, PRODUCTION } from "../../providers";
import { ApiService } from "../api/api.service";

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
});
