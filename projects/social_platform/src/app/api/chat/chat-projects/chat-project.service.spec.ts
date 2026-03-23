/** @format */

import { TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ChatProjectService } from "./chat-project.service";

describe("ChatProjectService", () => {
  let service: ChatProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ChatProjectService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
