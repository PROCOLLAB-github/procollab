/** @format */

import { TestBed } from "@angular/core/testing";

import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("AuthRepository", () => {
  let service: AuthRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthRepository],
    });
    service = TestBed.inject(AuthRepository);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
