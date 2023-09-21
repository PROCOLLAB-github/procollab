/** @format */

import { TestBed } from "@angular/core/testing";

import { ChatGroupsResolver } from "./chat-groups.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ChatGroupsResolver", () => {
  let resolver: ChatGroupsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ChatGroupsResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
