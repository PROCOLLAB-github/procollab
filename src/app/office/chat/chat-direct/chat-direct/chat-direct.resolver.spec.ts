/** @format */

import { TestBed } from "@angular/core/testing";

import { ChatDirectResolver } from "./chat-direct.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ChatDirectResolver", () => {
  let resolver: ChatDirectResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ChatDirectResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
