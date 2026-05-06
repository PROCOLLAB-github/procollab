/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetSkillsNestedUseCase } from "./get-skills-nested.use-case";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SkillsGroup } from "@domain/skills/skills-group";

describe("GetSkillsNestedUseCase", () => {
  let useCase: GetSkillsNestedUseCase;
  let repo: jasmine.SpyObj<SkillsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<SkillsRepositoryPort>("SkillsRepositoryPort", ["getSkillsNested"]);
    TestBed.configureTestingModule({
      providers: [GetSkillsNestedUseCase, { provide: SkillsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetSkillsNestedUseCase);
  }

  it("делегирует вызов в репозиторий", () => {
    setup();
    repo.getSkillsNested.and.returnValue(of([]));

    useCase.execute().subscribe();

    expect(repo.getSkillsNested).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok с группами навыков", done => {
    setup();
    const groups = [{ id: 1, name: "frontend", skills: [] }] as unknown as SkillsGroup[];
    repo.getSkillsNested.and.returnValue(of(groups));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(groups);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'server_error' }", done => {
    setup();
    repo.getSkillsNested.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("server_error");
      done();
    });
  });
});
