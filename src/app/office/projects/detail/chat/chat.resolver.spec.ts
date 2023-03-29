/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectChatResolver } from "./chat.resolver";
import { ProjectService } from "@services/project.service";

describe("ChatResolver", () => {
  let resolver: ProjectChatResolver;

  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj(["getOne"]);

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectService, useValue: projectSpy }],
    });
    resolver = TestBed.inject(ProjectChatResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
