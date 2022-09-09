/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsAllResolver } from "./all.resolver";
import { of } from "rxjs";
import { ProjectService } from "../../services/project.service";

describe("ProjectsAllResolver", () => {
  let resolver: ProjectsAllResolver;

  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj({ getAll: of([]) });

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectService, useValue: projectSpy }],
    });
    resolver = TestBed.inject(ProjectsAllResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
