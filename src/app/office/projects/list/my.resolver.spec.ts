/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsMyResolver } from "./my.resolver";
import { of } from "rxjs";
import { ProjectService } from "../../services/project.service";

describe("MyResolver", () => {
  let resolver: ProjectsMyResolver;

  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj({ getAll: of([]) });

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectService, useValue: projectSpy }],
    });

    resolver = TestBed.inject(ProjectsMyResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
