/** @format */

import { TestBed } from "@angular/core/testing";

import { ApiService } from "./api.service";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
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

  it("posts a full file selection and returns the original XLSX Blob", () => {
    const body = { selection: { mode: "all", excludedIds: [7] } };
    const blob = new Blob(["xlsx"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    let result: Blob | undefined;
    service.postFile("/attention/export/", body).subscribe(value => (result = value));
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne("/attention/export/");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual(body);
    expect(request.request.responseType).toBe("blob");
    request.flush(blob);
    expect(result).toBe(blob);
    http.verify();
  });
});
