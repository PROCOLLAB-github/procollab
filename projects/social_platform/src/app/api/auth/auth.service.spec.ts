/** @format */

import { TestBed } from "@angular/core/testing";

import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL, PRODUCTION, ApiService, TokenService } from "@corelib";
import { ChatStateService } from "@api/chat/chat-state.service";

describe("AuthRepository", () => {
  let service: AuthRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthRepository,
        ApiService,
        { provide: API_URL, useValue: "" },
        { provide: PRODUCTION, useValue: false },
        { provide: ChatStateService, useValue: jasmine.createSpyObj("ChatStateService", ["reset"]) },
      ],
    });
    service = TestBed.inject(AuthRepository);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
