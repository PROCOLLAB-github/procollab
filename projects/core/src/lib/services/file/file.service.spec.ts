/** @format */

import { TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { FileService } from "../file.service";
import { AuthService } from "projects/social_platform/src/app/api/auth";

describe("FileService", () => {
  let service: FileService;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj(["getTokens"]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    service = TestBed.inject(FileService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
