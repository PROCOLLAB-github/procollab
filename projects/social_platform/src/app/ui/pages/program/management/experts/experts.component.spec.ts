/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { ManagementExpertsComponent } from "./experts.component";
import { ExpertWorkspace, AssignmentOptions } from "@domain/program/evaluation-workspace.model";

describe("Управление экспертами", () => {
  it("объясняет исключённый черновик в составе и пустом плане распределения", async () => {
    const { fixture, component } = setup();
    const unavailableProjects = [
      { projectId: 99, projectName: "Проект-черновик", reason: "draft" as const },
    ];
    component.snapshot.update(state => ({ ...state!, unavailableProjects }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".experts__quota").textContent).toContain(
      "Среди сданных проектов есть черновики",
    );
    component.open("auto");
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    let dialog = document.querySelector(".experts__dialog")!;
    expect(dialog.textContent).toContain("Проект-черновик — черновик");
    component.plan.set({
      revision: "v1",
      planToken: "signed",
      assignments: [],
      shortages: [],
      load: [],
      unavailableProjects,
    });
    fixture.detectChanges();
    dialog = document.querySelector(".experts__dialog")!;
    expect(dialog.textContent).toContain("Для всех доступных к оценке проектов");
    expect(dialog.textContent).toContain("Автору нужно опубликовать проект");
    expect((dialog.querySelector("button[appButton=primary]") as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
  it("различает нехватку состава экспертов и полученные оценки", () => {
    const { fixture, component } = setup();
    component.snapshot.update(state => ({
      ...state!,
      requiredEvaluators: 1,
      submittedProjects: 2,
      projectsMissingExperts: 1,
      missingAssignments: 1,
      readyProjects: 0,
    }));
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector(".experts__quota").textContent;
    expect(summary).toContain("Оценок для каждого проекта: 1");
    expect(summary).toContain("для 1 из 2 проектов");
    expect(summary).toContain("Полностью оценено: 0");
    expect(summary).not.toContain("назначений");
  });
  it("обновляет отправку письма без сброса поиска и прекращает проверку после sent", async () => {
    vi.useFakeTimers();
    try {
      const { fixture, component, api } = setup();
      const queued = structuredClone(snapshot);
      queued.experts[1].deliveryStatus = "queued";
      api.workspace.mockReturnValue(of(queued));
      component.load();
      fixture.detectChanges();
      const search = fixture.nativeElement.querySelector("input[type=search]") as HTMLInputElement;
      search.focus();
      search.value = "pending";
      search.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Письмо в очереди");
      api.workspace.mockReturnValue(of(structuredClone(snapshot)));
      await vi.advanceTimersByTimeAsync(3000);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Письмо отправлено · ждём принятия");
      expect(search.value).toBe("pending");
      expect(document.activeElement).toBe(search);
      const calls = api.workspace.mock.calls.length;
      await vi.advanceTimersByTimeAsync(10000);
      expect(api.workspace).toHaveBeenCalledTimes(calls);
      fixture.destroy();
    } finally {
      vi.useRealTimers();
    }
  });
  it("отменяет фоновую проверку письма при уходе со страницы", async () => {
    vi.useFakeTimers();
    try {
      const { fixture, component, api } = setup();
      const queued = structuredClone(snapshot);
      queued.experts[1].deliveryStatus = "queued";
      api.workspace.mockReturnValue(of(queued));
      component.load();
      fixture.detectChanges();
      fixture.destroy();
      const calls = api.workspace.mock.calls.length;
      await vi.advanceTimersByTimeAsync(15000);
      expect(api.workspace).toHaveBeenCalledTimes(calls);
    } finally {
      vi.useRealTimers();
    }
  });
  it("останавливает долгую проверку и убирает предупреждение после получения статуса", async () => {
    vi.useFakeTimers();
    try {
      const { fixture, component, api } = setup();
      const queued = structuredClone(snapshot);
      queued.experts[1].deliveryStatus = "queued";
      api.workspace.mockReturnValue(of(queued));
      component.load();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(123000);
      fixture.detectChanges();
      expect(component.deliveryRefreshPaused()).toBe(true);
      const calls = api.workspace.mock.calls.length;
      await vi.advanceTimersByTimeAsync(15000);
      expect(api.workspace).toHaveBeenCalledTimes(calls);
      api.workspace.mockReturnValue(of(structuredClone(snapshot)));
      component.load();
      fixture.detectChanges();
      expect(component.deliveryRefreshPaused()).toBe(false);
      fixture.destroy();
    } finally {
      vi.useRealTimers();
    }
  });
  it("предлагает только принявших приглашение и не применяет план при предпросмотре", () => {
    const { fixture, component, api } = setup();
    component.open("auto");
    fixture.detectChanges();
    api.allocation.mockReturnValue(
      of({ revision: "v1", planToken: "signed", assignments: [], shortages: [], load: [] }),
    );
    component.previewAllocation();
    expect(api.allocation).toHaveBeenCalledWith(42, { expertIds: [1] });
    expect(api.applyAllocation).not.toHaveBeenCalled();
    expect(component.label(snapshot.experts[1])).toBe("Приглашён");
    expect(component.deliveryLabel({ ...snapshot.experts[1], deliveryStatus: "failed" })).toBe(
      "Не удалось отправить письмо",
    );
  });
  it("отправляет приглашение через native submit и предотвращает перезагрузку", async () => {
    const { fixture, component, api } = setup();
    component.open("invite");
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    component.email.setValue("expert@example.com");
    const form = document.querySelector(".experts__dialog form") as HTMLFormElement;
    expect(form).toBeTruthy();
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(api.invite).toHaveBeenCalledWith(42, "expert@example.com");
  });
  const snapshot: ExpertWorkspace = {
    revision: "v1",
    requiredEvaluators: 2,
    managedEvaluation: true,
    submittedProjects: 3,
    missingAssignments: 3,
    readyProjects: 0,
    experts: [
      {
        id: 1,
        name: "Мария Иванова",
        email: "maria@example.com",
        status: "joined",
        assigned: 1,
        completed: 0,
        remaining: 1,
      },
      {
        id: "invite-2",
        invitationId: 2,
        name: null,
        email: "pending@example.com",
        status: "pending",
        deliveryStatus: "sent",
        assigned: null,
        completed: null,
        remaining: null,
      },
    ],
  };
  const options: AssignmentOptions = {
    revision: "v1",
    projects: [
      {
        id: 10,
        name: "С оценкой",
        caseName: "Первый",
        submitted: true,
        assigned: true,
        protected: true,
        completed: true,
        ownTeam: false,
      },
      {
        id: 11,
        name: "Новый проект",
        caseName: "Второй",
        submitted: true,
        assigned: false,
        protected: false,
        completed: false,
        ownTeam: false,
      },
      {
        id: 12,
        name: "Своя команда",
        caseName: null,
        submitted: true,
        assigned: false,
        protected: false,
        completed: false,
        ownTeam: true,
      },
    ],
  };
  function setup() {
    const api = {
      workspace: vi.fn(() => of(structuredClone(snapshot))),
      assignments: vi.fn(() => of(options)),
      saveAssignments: vi.fn(() => of(options)),
      invite: vi.fn(() => of({})),
      allocation: vi.fn(),
      applyAllocation: vi.fn(),
      quota: vi.fn(),
      saveQuota: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [ManagementExpertsComponent],
      providers: [{ provide: EvaluationUseCase, useValue: api }],
    });
    const fixture = TestBed.createComponent(ManagementExpertsComponent);
    fixture.componentRef.setInput("programId", 42);
    fixture.componentRef.setInput("confirmDiscard", () => Promise.resolve(false));
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, api };
  }
  it("поиск сохраняет значение и фокус при обновлении состава", () => {
    const { fixture, component } = setup();
    const search = fixture.nativeElement.querySelector("input[type=search]") as HTMLInputElement;
    search.focus();
    search.value = "Мария";
    search.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    component.load();
    fixture.detectChanges();
    expect(component.filtered().length).toBe(1);
    expect(search.value).toBe("Мария");
    expect(document.activeElement).toBe(search);
  });
  it("повторный выбор строки снимает выделение", () => {
    const { fixture, component } = setup();
    const row = fixture.nativeElement.querySelector("tbody tr");
    row.click();
    fixture.detectChanges();
    expect(component.selected()?.id).toBe(1);
    row.click();
    fixture.detectChanges();
    expect(component.selected()).toBeNull();
  });
  it("сохранённые оценки и собственная команда защищены, разрешённый проект назначается", () => {
    const { component, api } = setup();
    component.select(snapshot.experts[0]);
    component.openAssignments();
    component.toggleProject(options.projects[0]);
    component.toggleProject(options.projects[2]);
    expect([...component.chosenProjects()]).toEqual([10]);
    component.toggleProject(options.projects[1]);
    component.saveAssignments();
    expect(api.saveAssignments).toHaveBeenCalledWith(42, 1, "v1", [10, 11]);
  });
  it("409 оставляет выбор и открытый редактор, фильтр кейса сохраняет значение", () => {
    const { component, api } = setup();
    component.select(snapshot.experts[0]);
    component.openAssignments();
    component.caseFilter.setValue("case:Второй");
    expect(component.visibleProjects().map(p => p.id)).toEqual([11]);
    component.toggleProject(options.projects[1]);
    api.saveAssignments.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.saveAssignments();
    expect(component.modal()).toBe("manual");
    expect(component.chosenProjects().has(11)).toBe(true);
    expect(component.caseFilter.value).toBe("case:Второй");
    expect(component.dialogError()).toBeTruthy();
  });
  it("pending исключён из распределения, план с нехваткой нельзя применить", () => {
    const { component, api } = setup();
    component.open("auto");
    expect([...component.chosenExperts()]).toEqual([1]);
    component.plan.set({
      revision: "v1",
      planToken: "signed",
      assignments: [],
      shortages: [{ projectId: 10, projectName: "P", missing: 1 }],
      load: [],
    });
    component.applyAllocation();
    expect(api.applyAllocation).not.toHaveBeenCalled();
  });
  it("новый ввод N сбрасывает старый предпросмотр и запрещает 0", () => {
    const { component } = setup();
    component.open("quota");
    component.quotaPreview.set({
      revision: "v1",
      requiredEvaluators: 2,
      readyBefore: 0,
      readyAfter: 0,
      missingAssignments: 0,
      surplusAssignments: 0,
    });
    component.quota.setValue(3);
    expect(component.quotaPreview()).toBeNull();
    component.quota.setValue(0);
    expect(component.quota.invalid).toBe(true);
  });
});
