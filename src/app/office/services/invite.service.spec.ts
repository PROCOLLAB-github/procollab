/** @format */

import { TestBed } from "@angular/core/testing";

import { InviteService } from "./invite.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("InviteService", () => {
  let service: InviteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(InviteService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
