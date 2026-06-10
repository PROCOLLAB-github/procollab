/** @format */

import { TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { FileService } from "./file.service";
import { API_URL } from "../../providers";

describe("FileService", () => {
  let service: FileService;

  beforeEach(() => {
    // FileService → ApiService → токен API_URL. AuthService больше не используется.
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: API_URL, useValue: "" }],
    });
    service = TestBed.inject(FileService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
