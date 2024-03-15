/** @format */

import { TestBed } from "@angular/core/testing";
import { NewsDetailResolver } from "./news-detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ProjectNewsService } from "../services/project-news.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";

describe("NewsDetailResolver", () => {
  const mockRoute = {
    params: { newsId: 1 },
    parent: { params: { projectId: 1 } },
  } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    const projectNewsSpy = jasmine.createSpyObj({ fetchNewsDetail: of({}) });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: ProjectNewsService, useValue: projectNewsSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      NewsDetailResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
