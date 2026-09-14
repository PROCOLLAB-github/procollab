/** @format */

import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Subject } from "rxjs";
import { EventBus } from "@domain/shared/event-bus";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { Project } from "@domain/project/project.model";
import { ApplyProjectToProgramUseCase } from "./use-cases/apply-project-to-program.use-case";
import { RateProjectUseCase } from "./use-cases/rate-project.use-case";
import { SubmitCompetitiveProjectUseCase } from "@api/project/use-cases/submit-competitive-project.use-case";
import { UpdateProgramLinkFieldsUseCase } from "@api/project/use-cases/update-program-link-fields.use-case";

describe("Program widget refresh after business operations", () => {
  let response: Subject<unknown>;
  const changed = vi.fn();
  beforeEach(() => {
    response = new Subject();
    changed.mockClear();
    const operation = () => response;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProgramRepositoryPort,
          useValue: { applyProjectToProgram: operation, submitCompettetiveProject: operation },
        },
        { provide: ProjectProgramRepositoryPort, useValue: { updateProgramLinkFields: operation } },
        {
          provide: ProjectRatingRepositoryPort,
          useValue: { rate: operation, formValuesToDTO: () => [] },
        },
      ],
    });
    TestBed.inject(EventBus).on("ProgramWidgetChanged").subscribe(changed);
  });
  const operations = [
    [
      "project link",
      () =>
        TestBed.inject(ApplyProjectToProgramUseCase).execute(12, {
          project: { id: 5 } as Project,
          programFieldValues: [],
        }),
    ],
    ["case/fields", () => TestBed.inject(UpdateProgramLinkFieldsUseCase).execute(34, [])],
    ["submission", () => TestBed.inject(SubmitCompetitiveProjectUseCase).execute(34)],
    ["evaluation", () => TestBed.inject(RateProjectUseCase).execute(5, [], {})],
  ] as const;
  it.each(operations)("refreshes after successful %s, never before response", (_, run) => {
    run().subscribe();
    expect(changed).not.toHaveBeenCalled();
    response.next({});
    response.complete();
    expect(changed).toHaveBeenCalledOnce();
  });
  it.each(operations)("does not refresh after failed %s", (_, run) => {
    run().subscribe();
    response.error(new Error("request failed"));
    expect(changed).not.toHaveBeenCalled();
  });
});
