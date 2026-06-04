/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { SkillsRepository } from "./skills.repository";
import { SkillsHttpAdapter } from "../../adapters/skills/skills-http.adapter";
import { SkillsGroup } from "@domain/skills/skills-group.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Skill } from "@domain/skills/skill.model";

describe("SkillsRepository", () => {
  let repository: SkillsRepository;
  let adapter: any;

  function setup(): void {
    adapter = { getSkillsNested: vi.fn(), getSkillsInline: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SkillsRepository, { provide: SkillsHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(SkillsRepository);
  }

  it("делегирует getSkillsNested в adapter", () => {
    setup();
    adapter.getSkillsNested.mockReturnValue(of([] as SkillsGroup[]));

    repository.getSkillsNested().subscribe();

    expect(adapter.getSkillsNested).toHaveBeenCalledExactlyOnceWith();
  });

  it("делегирует getSkillsInline(search, limit, offset) в adapter", () => {
    setup();
    adapter.getSkillsInline.mockReturnValue(
      of({ count: 0, results: [], next: "", previous: "" } as ApiPagination<Skill>),
    );

    repository.getSkillsInline("js", 10, 20).subscribe();

    expect(adapter.getSkillsInline).toHaveBeenCalledExactlyOnceWith("js", 10, 20);
  });
});
