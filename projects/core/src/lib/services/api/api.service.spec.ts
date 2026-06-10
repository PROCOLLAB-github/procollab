/** @format */

import { TestBed } from "@angular/core/testing";

import { ApiService } from "./api.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL } from "../../providers";

describe("ApiService", () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, { provide: API_URL, useValue: "" }],
    });
    service = TestBed.inject(ApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
