/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SearchSkillsUseCase } from "./search-skills.use-case";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { Skill } from "@domain/skills/skill.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("SearchSkillsUseCase", () => {
  let useCase: SearchSkillsUseCase;
  let repo: any;

  const page: ApiPagination<Skill> = { count: 0, results: [], next: "", previous: "" };

  function setup(): void {
    repo = { getSkillsInline: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SearchSkillsUseCase, { provide: SkillsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SearchSkillsUseCase);
  }

  it("делегирует вызов с параметрами поиска", () => {
    setup();
    repo.getSkillsInline.mockReturnValue(of(page));

    useCase.execute("angular", 10, 20).subscribe();

    expect(repo.getSkillsInline).toHaveBeenCalledExactlyOnceWith("angular", 10, 20);
  });

  it("при успехе возвращает ok со страницей навыков", () =>
    new Promise<void>(done => {
      setup();
      repo.getSkillsInline.mockReturnValue(of(page));

      useCase.execute("", 10, 0).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getSkillsInline.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute("", 10, 0).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
