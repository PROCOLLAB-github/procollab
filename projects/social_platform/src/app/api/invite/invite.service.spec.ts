/** @format */

import { TestBed } from "@angular/core/testing";

import { InviteService } from "../office/services/invite.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";

describe("InviteService", () => {
  let service: InviteService;

  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
    service = TestBed.inject(InviteService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
