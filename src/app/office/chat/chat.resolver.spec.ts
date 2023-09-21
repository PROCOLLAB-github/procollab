/** @format */

import { TestBed } from "@angular/core/testing";

import { ChatResolver } from "./chat.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ChatResolver", () => {
  let resolver: ChatResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ChatResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
