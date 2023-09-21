/** @format */

import { TestBed } from "@angular/core/testing";

import { ChatDirectService } from "./chat-direct.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ChatDirectService", () => {
  let service: ChatDirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ChatDirectService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
