/** @format */

import { TestBed } from "@angular/core/testing";

import { ChatDirectResolver } from "./chat-direct.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ChatDirectResolver", () => {
  const mockRoute = { params: { chatId: 1 } } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ChatDirectResolver(mockRoute, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
