/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ProgramResults, ResultProject } from "@domain/program/program-results.model";
import { ManagementResultsComponent } from "./results.component";

const project = (
  id: number,
  name: string,
  score: number | null,
  place: number | null,
): ResultProject => ({
  id,
  projectId: id,
  name,
  score,
  place,
  ready: place !== null,
  completed: score === null ? 0 : place === null ? 2 : 3,
  required: 3,
  caseName: 'Кейс "А"',
  averages: {},
  experts: [],
});
const snapshot: ProgramResults = {
  programId: 42,
  programName: "Программа",
  generatedAt: "2026-10-19T12:00:00Z",
  requiredEvaluators: 3,
  maximum: 30,
  hasNumericCriteria: true,
  caseOptions: ['Кейс "А"', "Т-Банк"],
  criteria: [],
  groups: [
    {
      caseName: 'Кейс "А"',
      projects: [
        project(1, "Город", 24, 1),
        project(2, "Маршрут", 22.33, 2),
        project(3, "Кампус", 22.33, 2),
        project(4, "Река", 20.67, 4),
        project(5, "Район", 26.5, null),
      ],
    },
    { caseName: "Т-Банк", projects: [{ ...project(6, "Ноль", 0, 1), caseName: "Т-Банк" }] },
  ],
};
function setup() {
  const api = {
    results: vi.fn(() => of(structuredClone(snapshot))),
    exportResults: vi.fn(() => new Subject<Blob>()),
  };
  TestBed.configureTestingModule({
    imports: [ManagementResultsComponent],
    providers: [{ provide: ProgramManagementUseCase, useValue: api }],
  });
  const fixture = TestBed.createComponent(ManagementResultsComponent);
  fixture.componentRef.setInput("programId", 42);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, api };
}
describe("Результаты программы", () => {
  it("сохраняет раскрытие эксперта при закрытии и повторном открытии проекта", () => {
    const { fixture, component } = setup();
    component.snapshot.update(data => ({
      ...data!,
      groups: data!.groups.map((group, index) =>
        index
          ? group
          : {
              ...group,
              projects: group.projects.map((row, i) =>
                i
                  ? row
                  : {
                      ...row,
                      experts: [
                        {
                          userId: 1,
                          name: "Эксперт",
                          email: "expert@example.test",
                          avatar: null,
                          complete: true,
                          total: 24,
                          values: [],
                        },
                      ],
                    },
              ),
            },
      ),
    }));
    component.toggle(1);
    fixture.detectChanges();
    fixture.nativeElement.querySelector(".results__expert").click();
    fixture.detectChanges();
    component.toggle(1);
    fixture.detectChanges();
    component.toggle(1);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".results__expert").getAttribute("aria-expanded"),
    ).toBe("true");
    expect(fixture.nativeElement.querySelector(".results__expert-values")).not.toBeNull();
  });

  it("переставляет баллы, сохраняя места и отделяя предварительный балл", () => {
    const { component } = setup();
    component.order.set("asc");
    const rows = component.groups()[0].projects;
    expect(rows.filter(p => p.ready).map(p => p.place)).toEqual([4, 2, 2, 1]);
    expect(rows.at(-1)?.name).toBe("Район");
    expect(component.groups()[1].projects[0].score).toBe(0);
    expect(component.format(null)).toBe("—");
    expect(component.format(0)).toContain("0,00");
  });
  it("сохраняет фокус поиска при фильтрации и сортировке", () => {
    const { fixture, component } = setup();
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.focus();
    input.value = "Ре";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    component.order.set("asc");
    fixture.detectChanges();
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Ре");
    expect(component.groups()[0].projects[0].place).toBe(4);
  });
  it("фильтрует кейс с кавычками и передаёт его в выгрузку без потери поиска", () => {
    const { fixture, component, api } = setup();
    component.caseFilter.setValue(component.caseKey('Кейс "А"'));
    component.search.setValue("Река");
    fixture.detectChanges();
    expect(component.groups()).toHaveLength(1);
    component.openModal("export");
    component.download();
    component.download();
    expect(api.exportResults).toHaveBeenCalledTimes(1);
    expect(api.exportResults).toHaveBeenCalledWith(42, {
      search: "Река",
      caseScope: "selected",
      caseName: 'Кейс "А"',
      order: "desc",
      scope: "current",
    });
    expect(component.exporting()).toBe(true);
  });
  it("показывает ошибку выгрузки и разрешает повторить", () => {
    const { component, api } = setup();
    api.exportResults.mockReturnValue(throwError(() => new Error("offline")));
    component.openModal("export");
    component.download();
    expect(component.exportError()).toBe(true);
    expect(component.exporting()).toBe(false);
    expect(component.modal()).toBe("export");
  });
  it("показывает сохраненные оценки только после раскрытия проекта", () => {
    const { fixture, component } = setup();
    component.toggle(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("#result-1")).not.toBeNull();
    component.toggle(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("#result-1")).toBeNull();
  });
});
