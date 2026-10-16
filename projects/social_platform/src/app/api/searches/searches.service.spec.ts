/** @format */

import { TestBed } from "@angular/core/testing";
import { FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { GetSpecializationsInlineUseCase } from "@api/specializations/use-cases/get-specializations-inline.use-case";
import { SearchesService } from "./searches.service";

describe("SearchesService: подбор навыков", () => {
  const angular = { id: 1, name: "Angular", category: { id: 1, name: "Разработка" }, approves: [] };
  const react = { ...angular, id: 2, name: "React" };
  let service: SearchesService;
  let requests: Map<string, Subject<any>>;
  let search: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    requests = new Map();
    search = vi.fn((query: string) => {
      const request = new Subject<any>();
      requests.set(query, request);
      return request;
    });
    TestBed.configureTestingModule({
      providers: [
        SearchesService,
        { provide: SkillsRepositoryPort, useValue: { getSkillsInline: search } },
        { provide: GetSpecializationsInlineUseCase, useValue: {} },
      ],
    });
    service = TestBed.inject(SearchesService);
  });

  it("старый ответ не заменяет результат более нового запроса", () => {
    service.onSearchSkill("ang");
    service.onSearchSkill("rea");
    requests.get("rea")!.next({ results: [react] });
    requests.get("ang")!.next({ results: [angular] });
    expect(service.inlineSkills()).toEqual([react]);
    expect(requests.get("ang")!.observed).toBe(false);
  });

  it("очистка отменяет запрос и не ищет пустую строку", () => {
    service.onSearchSkill("ang");
    service.onSearchSkill("");
    requests.get("ang")!.next({ results: [angular] });
    expect(service.inlineSkills()).toEqual([]);
    expect(search).toHaveBeenCalledTimes(1);
    expect(requests.get("ang")!.observed).toBe(false);
  });

  it("уничтожение формы отписывает незавершённый запрос", () => {
    service.onSearchSkill("ang");
    TestBed.resetTestingModule();
    expect(requests.get("ang")!.observed).toBe(false);
  });

  it("ошибка завершает текущий поиск, следующий запрос продолжает работать", () => {
    service.onSearchSkill("ang");
    requests.get("ang")!.error(new Error("network"));
    expect(service.inlineSkills()).toEqual([]);
    service.onSearchSkill("rea");
    requests.get("rea")!.next({ results: [react] });
    expect(service.inlineSkills()).toEqual([react]);
  });

  it("поиск и библиотека не дублируют навык, удаление работает по id", () => {
    const form = new FormGroup({ skills: new FormControl([angular]) });
    service.onAddSkill({ ...angular }, form);
    service.onAddSkill(react, form);
    service.onToggleSkill({ ...angular }, form);
    expect(form.value.skills).toEqual([react]);
    service.onRemoveSkill(react, form);
    expect(form.value.skills).toEqual([]);
  });
});
