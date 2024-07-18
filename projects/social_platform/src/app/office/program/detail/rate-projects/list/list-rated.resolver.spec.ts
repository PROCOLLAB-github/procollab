/** @format */

import { TestBed } from "@angular/core/testing";

import { ListRatedResolver } from "./list-rated.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ListRatedResolver", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ListRatedResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
