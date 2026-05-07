/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { SkillsRepository } from "./skills.repository";
import { SkillsHttpAdapter } from "../../adapters/skills/skills-http.adapter";
import { SkillsGroup } from "@domain/skills/skills-group";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Skill } from "@domain/skills/skill";

describe("SkillsRepository", () => {
  let repository: SkillsRepository;
  let adapter: jasmine.SpyObj<SkillsHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<SkillsHttpAdapter>("SkillsHttpAdapter", [
      "getSkillsNested",
      "getSkillsInline",
    ]);
    TestBed.configureTestingModule({
      providers: [SkillsRepository, { provide: SkillsHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(SkillsRepository);
  }

  it("делегирует getSkillsNested в adapter", () => {
    setup();
    adapter.getSkillsNested.and.returnValue(of([] as SkillsGroup[]));

    repository.getSkillsNested().subscribe();

    expect(adapter.getSkillsNested).toHaveBeenCalledOnceWith();
  });

  it("делегирует getSkillsInline(search, limit, offset) в adapter", () => {
    setup();
    adapter.getSkillsInline.and.returnValue(
      of({ count: 0, results: [], next: "", previous: "" } as ApiPagination<Skill>)
    );

    repository.getSkillsInline("js", 10, 20).subscribe();

    expect(adapter.getSkillsInline).toHaveBeenCalledOnceWith("js", 10, 20);
  });
});
