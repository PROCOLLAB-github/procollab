/** @format */

import { TestBed } from "@angular/core/testing";

import { WebsocketService } from "./websocket.service";
import { TokenService } from "../tokens/token.service";

describe("WebsocketService", () => {
  let service: WebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        {
          provide: TokenService,
          useValue: jasmine.createSpyObj("TokenService", ["getTokens", "clearTokens", "memTokens", "refreshTokens", "getCookieOptions"]),
        },
      ],
    });
    service = TestBed.inject(WebsocketService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
