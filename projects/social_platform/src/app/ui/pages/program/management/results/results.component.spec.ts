/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
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
    providers: [provideRouter([]), { provide: ProgramManagementUseCase, useValue: api }],
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
    fixture.nativeElement.querySelector(".results__expert-toggle").click();
    fixture.detectChanges();
    component.toggle(1);
    fixture.detectChanges();
    component.toggle(1);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".results__expert-toggle").getAttribute("aria-expanded"),
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
      status: "all",
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
  it("делит общую выборку на 20 строк через границы кейсов и сохраняет места", () => {
    const { component, fixture, api } = setup();
    const rows = Array.from({ length: 45 }, (_, index) => ({
      ...project(index + 1, `Проект ${index + 1}`, 100 - index, index + 1),
      caseName: index < 25 ? "А" : "Б",
    }));
    const data = {
      ...snapshot,
      groups: [
        { caseName: "А", projects: rows.slice(0, 25) },
        { caseName: "Б", projects: rows.slice(25) },
      ],
    };
    component.snapshot.set(data);
    fixture.detectChanges();
    expect(
      component
        .pageGroups()
        .flatMap(g => g.projects)
        .map(p => p.id),
    ).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    component.page.set(1);
    fixture.detectChanges();
    expect(component.pageGroups().map(g => g.projects.length)).toEqual([5, 15]);
    expect(
      component
        .pageGroups()
        .flatMap(g => g.projects)
        .map(p => p.place),
    ).toEqual(Array.from({ length: 20 }, (_, i) => i + 21));
    component.page.set(2);
    fixture.detectChanges();
    expect([component.pageStart(), component.pageEnd(), component.projectCount()]).toEqual([
      41, 45, 45,
    ]);
    component.openModal("export");
    component.download();
    expect(api.exportResults.mock.calls[0][1]).toEqual({
      search: "",
      caseScope: "all",
      caseName: undefined,
      order: "desc",
      scope: "current",
      status: "all",
    });
    component.search.setValue("nothing");
    fixture.detectChanges();
    expect(component.currentPage()).toBe(0);
    expect(component.projectCount()).toBe(0);
  });
  it("считает безбалльный завершенный проект готовым к завершению, без места и балла", () => {
    const { component, fixture } = setup();
    const complete = {
      ...project(1, "Завершен", null, null),
      completed: 3,
      evaluationComplete: true,
    };
    const pending = {
      ...project(2, "Ожидает", null, null),
      completed: 1,
      evaluationComplete: false,
    };
    component.snapshot.set({
      ...snapshot,
      hasNumericCriteria: false,
      maximum: null,
      groups: [{ caseName: "Кейс", projects: [complete, pending] }],
    });
    fixture.detectChanges();
    expect([component.readyCount(), component.pendingCount()]).toEqual([1, 1]);
    component.statusFilter.setValue("complete");
    fixture.detectChanges();
    expect(component.groups()[0].projects.map(p => p.id)).toEqual([1]);
    expect(fixture.nativeElement.querySelector(".results__count").textContent).toContain(
      "Оценивание завершено",
    );
    expect(fixture.nativeElement.querySelector(".results__score")).toBeNull();
    expect(fixture.nativeElement.querySelector(".results__place")).toBeNull();
    component.togglePending();
    fixture.detectChanges();
    expect(component.groups()[0].projects.map(p => p.id)).toEqual([2]);
    expect(component.readyCount()).toBe(1);
  });
  it("применяет фильтры только явно и сохраняет статус в выгрузке", () => {
    const { component, fixture, api } = setup();
    component.openModal("filters");
    component.draftCase.setValue(component.caseKey('Кейс "А"'));
    component.draftStatus.setValue("pending");
    fixture.detectChanges();
    expect(component.projectCount()).toBe(6);
    component.modal.set(null);
    expect(component.statusFilter.value).toBe("all");
    component.openModal("filters");
    expect(component.draftStatus.value).toBe("all");
    component.draftStatus.setValue("pending");
    component.applyFilters();
    fixture.detectChanges();
    expect(component.projectCount()).toBe(1);
    component.openModal("export");
    component.download();
    expect(api.exportResults.mock.calls[0][1].status).toBe("pending");
  });
  it("обновляет время и баллы без сброса поиска, сортировки и раскрытия; исключает повторный запрос", () => {
    const { component, fixture, api } = setup();
    component.search.setValue("Р");
    component.caseFilter.setValue(component.caseKey('Кейс "А"'));
    component.order.set("asc");
    component.toggle(4);
    fixture.detectChanges();
    const incoming = new Subject<ProgramResults>();
    api.results.mockReturnValue(incoming);
    component.refresh();
    component.refresh();
    expect(api.results).toHaveBeenCalledTimes(2);
    expect(component.loading()).toBe(true);
    incoming.next({ ...snapshot, generatedAt: "2026-10-19T12:01:00Z" });
    incoming.complete();
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.search.value).toBe("Р");
    expect(component.order()).toBe("asc");
    expect(component.expanded().has(4)).toBe(true);
    expect(component.snapshot()?.generatedAt).toContain("12:01:00");
    api.results.mockReturnValue(throwError(() => new Error("offline")));
    component.refresh();
    expect(component.error()).toBe(true);
    expect(component.snapshot()?.groups.length).toBe(2);
    expect(component.loading()).toBe(false);
  });
  it("сокращение выборки при обновлении сдвигает текущую страницу в допустимый диапазон", () => {
    const { component, fixture, api } = setup();
    const rows = Array.from({ length: 45 }, (_, i) =>
      project(i + 1, `Проект ${i + 1}`, 100 - i, i + 1),
    );
    component.snapshot.set({ ...snapshot, groups: [{ caseName: "А", projects: rows }] });
    fixture.detectChanges();
    component.page.set(2);
    fixture.detectChanges();
    api.results.mockReturnValue(
      of({ ...snapshot, groups: [{ caseName: "А", projects: rows.slice(0, 5) }] }),
    );
    component.refresh();
    fixture.detectChanges();
    expect(component.page()).toBe(0);
    expect([component.pageStart(), component.pageEnd()]).toEqual([1, 5]);
  });
});
