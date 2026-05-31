/** @format */

import { TestBed } from "@angular/core/testing";
import { NewsDetailResolver } from "./news-detail.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { GetProjectNewsDetailUseCase } from "@api/project/use-cases/get-project-news-detail.use-case";

describe("NewsDetailResolver", () => {
  const mockRoute = {
    params: { newsId: 1 },
    parent: { params: { projectId: 1 } },
  } as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetProjectNewsDetailUseCase,
          useValue: { execute: () => of({ ok: true, value: {} }) },
        },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      NewsDetailResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
