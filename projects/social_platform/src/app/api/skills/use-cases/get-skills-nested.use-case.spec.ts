/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetSkillsNestedUseCase } from "./get-skills-nested.use-case";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SkillsGroup } from "@domain/skills/skills-group.model";

describe("GetSkillsNestedUseCase", () => {
  let useCase: GetSkillsNestedUseCase;
  let repo: any;

  function setup(): void {
    repo = { getSkillsNested: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetSkillsNestedUseCase, { provide: SkillsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetSkillsNestedUseCase);
  }

  it("делегирует вызов в репозиторий", () => {
    setup();
    repo.getSkillsNested.mockReturnValue(of([]));

    useCase.execute().subscribe();

    expect(repo.getSkillsNested).toHaveBeenCalledExactlyOnceWith();
  });

  it("при успехе возвращает ok с группами навыков", () =>
    new Promise<void>(done => {
      setup();
      const groups = [{ id: 1, name: "frontend", skills: [] }] as unknown as SkillsGroup[];
      repo.getSkillsNested.mockReturnValue(of(groups));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(groups);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getSkillsNested.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
