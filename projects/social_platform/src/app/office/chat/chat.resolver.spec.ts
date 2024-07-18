/** @format */

import { TestBed } from "@angular/core/testing";
import { ChatResolver } from "./chat.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ChatResolver", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ChatResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
