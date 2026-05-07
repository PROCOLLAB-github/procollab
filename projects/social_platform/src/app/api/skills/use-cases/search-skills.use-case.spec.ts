/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SearchSkillsUseCase } from "./search-skills.use-case";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { Skill } from "@domain/skills/skill";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("SearchSkillsUseCase", () => {
  let useCase: SearchSkillsUseCase;
  let repo: jasmine.SpyObj<SkillsRepositoryPort>;

  const page: ApiPagination<Skill> = { count: 0, results: [], next: "", previous: "" };

  function setup(): void {
    repo = jasmine.createSpyObj<SkillsRepositoryPort>("SkillsRepositoryPort", ["getSkillsInline"]);
    TestBed.configureTestingModule({
      providers: [SearchSkillsUseCase, { provide: SkillsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SearchSkillsUseCase);
  }

  it("делегирует вызов с параметрами поиска", () => {
    setup();
    repo.getSkillsInline.and.returnValue(of(page));

    useCase.execute("angular", 10, 20).subscribe();

    expect(repo.getSkillsInline).toHaveBeenCalledOnceWith("angular", 10, 20);
  });

  it("при успехе возвращает ok со страницей навыков", done => {
    setup();
    repo.getSkillsInline.and.returnValue(of(page));

    useCase.execute("", 10, 0).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'server_error' }", done => {
    setup();
    repo.getSkillsInline.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute("", 10, 0).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("server_error");
      done();
    });
  });
});
