/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { ManagementExpertsComponent } from "./experts.component";
import { ExpertWorkspace, DistributionProject } from "@domain/program/evaluation-workspace.model";

describe("Управление экспертами", () => {
  it("отделяет состав от распределения и показывает одну строку правила", () => {
    const { fixture, component } = setup();
    expect(fixture.nativeElement.querySelector(".experts__quota")).toBeNull();
    component.switchTab("distribution");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".experts__quota").textContent).toContain(
      "Оценок для каждого проекта: 2",
    );
    expect(fixture.nativeElement.textContent).toContain("Проекты на оценку");
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
      expect(fixture.nativeElement.textContent).toContain("Письмо отправлено · ждем принятия");
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
    expect(component.canPreviewAllocation()).toBe(false);
    component.openPool("Сбер");
    component.toggleCandidate(snapshot.experts[0]);
    component.savePool();
    component.openPool("Т-Банк");
    component.toggleCandidate(snapshot.experts[0]);
    component.savePool();
    api.allocation.mockReturnValue(
      of({ revision: "v1", planToken: "signed", assignments: [], shortages: [], load: [] }),
    );
    component.previewAllocation();
    expect(api.allocation).toHaveBeenCalledWith(42, {
      expertIds: [1],
      revision: "v1",
      casePools: [
        { caseName: "Сбер", expertIds: [1] },
        { caseName: "Т-Банк", expertIds: [1] },
      ],
    });
    expect(api.applyAllocation).not.toHaveBeenCalled();
    expect(component.label(snapshot.experts[1])).toBe("Приглашен");
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
    component.toggleScope("Сбер");
    const form = document.querySelector(".experts__dialog form") as HTMLFormElement;
    expect(form).toBeTruthy();
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(api.invite).toHaveBeenCalledWith(42, "expert@example.com", {
      allCases: false,
      caseNames: ["Сбер"],
    });
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
  const projects: DistributionProject[] = [
    {
      id: 10,
      name: "Город",
      caseName: "Сбер",
      leaderId: 90,
      teamUserIds: [],
      experts: [
        {
          expertId: 1,
          name: "Мария",
          email: "maria@example.com",
          completed: false,
          protected: true,
        },
      ],
    },
    { id: 11, name: "Маршрут", caseName: "Сбер", leaderId: 91, teamUserIds: [], experts: [] },
    { id: 12, name: "Финплан", caseName: "Т-Банк", leaderId: 92, teamUserIds: [], experts: [] },
  ];
  function setup() {
    const api = {
      workspace: vi.fn(() =>
        of({
          ...structuredClone(snapshot),
          cases: ["Сбер", "Т-Банк"],
          projects: structuredClone(projects),
        }),
      ),
      bulkExperts: vi.fn(() => of(structuredClone(snapshot))),
      saveCaseScope: vi.fn(() => of(structuredClone(snapshot))),
      saveInvitationCaseScope: vi.fn(() => of(structuredClone(snapshot))),
      saveProjectExperts: vi.fn(() => of(structuredClone(snapshot))),
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
  it("чекбокс выбирает эксперта для массового действия, меню доступно без выбора", () => {
    const { fixture, component } = setup();
    const checkbox = fixture.nativeElement.querySelector(
      "tbody input[type=checkbox]",
    ) as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();
    expect(component.selectedExpertIds().has(1)).toBe(true);
    checkbox.click();
    fixture.detectChanges();
    expect(component.selectedExpertIds().size).toBe(0);
    (fixture.nativeElement.querySelector("app-row-actions button") as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".experts__floating")).toBeNull();
    expect(document.querySelector("[role=menu]")?.textContent).toContain("Посмотреть назначения");
  });
  it("Выбрать всех работает по всему фильтру, а массовый отзыв запрещен для принявших приглашение", () => {
    const { component, api } = setup();
    component.selectAllExperts();
    expect(component.selectedExpertIds().size).toBe(2);
    component.bulkExperts("revoke");
    expect(api.bulkExperts).not.toHaveBeenCalled();
    component.status.setValue("pending");
    component.selectAllExperts();
    component.bulkExperts("resend");
    expect(api.bulkExperts).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ action: "resend", invitationIds: [2], expertIds: [] }),
    );
  });

  it("pending исключён из распределения, план с нехваткой нельзя применить", () => {
    const { component, api } = setup();
    component.open("auto");
    expect(component.poolExperts("Сбер")).toEqual([]);
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
  it("можно выбрать разные кейсы, но ручное назначение требует одного кейса", () => {
    const { fixture, component } = setup();
    component.switchTab("distribution");
    component.selectVisibleProjects();
    expect(component.selectedProjects().size).toBe(3);
    expect(component.mixedProjectCases()).toBe(true);
    component.openProject();
    expect(component.modal()).toBeNull();
    component.toggleDistributionProject(projects[2]);
    expect(component.selectedProjects().size).toBe(2);
    component.openProject();
    expect(component.modal()).toBe("project");
    component.modal.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".experts__floating")).toBeTruthy();
    component.selectedProjects.set(new Set());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".experts__floating")).toBeNull();
  });

  it("поиск проекта и фильтр кейса сохраняются при обновлении данных", () => {
    const { fixture, component } = setup();
    component.switchTab("distribution");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input[type=search]") as HTMLInputElement;
    input.focus();
    input.value = "Мар";
    input.dispatchEvent(new Event("input"));
    component.distributionCase.setValue(JSON.stringify("Сбер"));
    fixture.detectChanges();
    component.load();
    fixture.detectChanges();
    expect(component.filteredDistribution().map(p => p.id)).toEqual([11]);
    expect(input.value).toBe("Мар");
    expect(document.activeElement).toBe(input);
    expect(component.distributionCase.value).toBe(JSON.stringify("Сбер"));
  });
  it("массовое назначение добавляет, одиночное заменяет и не снимает сохранённую оценку", () => {
    const { component, api } = setup();
    component.toggleDistributionProject(projects[0]);
    component.toggleDistributionProject(projects[1]);
    component.openProject();
    component.toggleCandidate(snapshot.experts[0]);
    component.saveProjectExperts();
    expect(api.saveProjectExperts).toHaveBeenCalledWith(42, {
      revision: "v1",
      projectIds: [10, 11],
      expertIds: [1],
      mode: "add",
    });
    component.snapshot.set({ ...structuredClone(snapshot), projects: structuredClone(projects) });
    component.openProject(projects[0]);
    component.toggleCandidate(snapshot.experts[0]);
    expect([...component.chosenExperts()]).toEqual([1]);
    expect(component.candidateReason(snapshot.experts[0])).toContain("сохранена");
  });
  it("универсальный эксперт доступен в обоих кейсах, ограниченный — только в своём", () => {
    const { component } = setup();
    const restricted = { ...snapshot.experts[0], id: 3, allCases: false, caseNames: ["Сбер"] };
    component.snapshot.update(s => ({ ...s!, experts: [...s!.experts, restricted] }));
    component.open("auto");
    expect(component.poolExperts("Сбер")).toEqual([]);
    component.openPool("Сбер");
    component.toggleCandidate(snapshot.experts[0]);
    component.toggleCandidate(restricted);
    component.savePool();
    expect(component.poolExperts("Сбер").map(e => e.id)).toEqual([1, 3]);
    component.openPool("Т-Банк");
    component.toggleCandidate(snapshot.experts[0]);
    component.toggleCandidate(restricted);
    expect(component.chosenExperts().has(3)).toBe(false);
    component.savePool();
    expect(component.poolExperts("Т-Банк").map(e => e.id)).toEqual([1]);
  });
  it("предпросмотр отправляет отдельные составы кейсов, повторяющегося эксперта один раз", () => {
    const { component, api } = setup();
    component.open("auto");
    component.openPool("Сбер");
    component.toggleCandidate(snapshot.experts[0]);
    component.savePool();
    component.openPool("Т-Банк");
    component.toggleCandidate(snapshot.experts[0]);
    component.savePool();
    api.allocation.mockReturnValue(
      of({ revision: "v1", planToken: "token", assignments: [], shortages: [], load: [] }),
    );
    component.previewAllocation();
    expect(api.allocation).toHaveBeenCalledWith(42, {
      expertIds: [1],
      revision: "v1",
      casePools: [
        { caseName: "Сбер", expertIds: [1] },
        { caseName: "Т-Банк", expertIds: [1] },
      ],
    });
    expect(api.applyAllocation).not.toHaveBeenCalled();
  });
  it("409 сохраняет выбранных экспертов и открытый редактор", () => {
    const { component, api } = setup();
    component.openProject(projects[1]);
    component.toggleCandidate(snapshot.experts[0]);
    api.saveProjectExperts.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    component.saveProjectExperts();
    expect(component.modal()).toBe("project");
    expect([...component.chosenExperts()]).toEqual([1]);
    expect(component.dialogError()).toBeTruthy();
  });
  it("при заполненном лимите фиксирует оценившего и блокирует еще одного эксперта", () => {
    const { fixture, component, api } = setup();
    const extra = { ...snapshot.experts[0], id: 3, name: "Анна" };
    component.snapshot.update(s => ({
      ...s!,
      requiredEvaluators: 1,
      experts: [...s!.experts, extra],
    }));
    component.openProject(projects[0]);
    fixture.detectChanges();
    component.toggleCandidate(snapshot.experts[0]);
    component.toggleCandidate(extra);
    expect([...component.chosenExperts()]).toEqual([1]);
    expect(component.candidateReason(extra)).toContain("лимит");
    expect(component.candidateReason(snapshot.experts[0])).toContain("сохранена");
    component.chosenExperts.set(new Set([1, 3]));
    component.saveProjectExperts();
    expect(api.saveProjectExperts).not.toHaveBeenCalled();
    expect(component.projectLimitExceeded()).toBe(true);
  });
  it("заменяет неоценившего в заполненном составе, сохраняя оценившего", () => {
    const { component, api } = setup();
    const waiting = { ...snapshot.experts[0], id: 3, name: "Борис" };
    const replacement = { ...snapshot.experts[0], id: 4, name: "Анна" };
    const project = structuredClone(projects[0]);
    project.experts.push({
      ...project.experts[0],
      expertId: 3,
      protected: false,
      completed: false,
    });
    component.snapshot.update(s => ({
      ...s!,
      experts: [...s!.experts, waiting, replacement],
      projects: [project],
    }));
    component.openProject(project);
    component.toggleCandidate(replacement);
    expect([...component.chosenExperts()]).toEqual([1, 3]);
    component.toggleCandidate(waiting);
    component.toggleCandidate(replacement);
    component.saveProjectExperts();
    expect(api.saveProjectExperts).toHaveBeenCalledWith(42, {
      revision: "v1",
      projectIds: [10],
      expertIds: [1, 4],
      mode: "replace",
    });
  });
  it("при массовом выборе учитывает оставшиеся места каждого проекта", () => {
    const { component, api } = setup();
    const extra = { ...snapshot.experts[0], id: 3 };
    component.snapshot.update(s => ({
      ...s!,
      requiredEvaluators: 1,
      experts: [...s!.experts, extra],
    }));
    component.toggleDistributionProject(projects[0]);
    component.toggleDistributionProject(projects[1]);
    component.openProject();
    component.toggleCandidate(extra);
    expect(component.chosenExperts().size).toBe(0);
    expect(component.candidateReason(extra)).toContain("нет свободных мест");
    component.toggleCandidate(snapshot.experts[0]);
    component.saveProjectExperts();
    expect(api.saveProjectExperts).toHaveBeenCalledWith(42, {
      revision: "v1",
      projectIds: [10, 11],
      expertIds: [1],
      mode: "add",
    });
  });
  it("при уменьшенном лимите сохраняет старый состав и разрешает снять неоценившего", async () => {
    const { fixture, component, api } = setup();
    const waiting = { ...snapshot.experts[0], id: 3 };
    const extra = { ...snapshot.experts[0], id: 4 };
    const project = structuredClone(projects[0]);
    project.experts.push({ ...project.experts[0], expertId: 3, protected: false });
    component.snapshot.update(s => ({
      ...s!,
      requiredEvaluators: 1,
      experts: [...s!.experts, waiting, extra],
      projects: [project],
    }));
    component.openProject(project);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(document.querySelector(".experts__dialog")?.textContent).toContain(
      "Лишние назначения сохранены",
    );
    expect(component.projectLimitExceeded()).toBe(false);
    component.toggleCandidate(extra);
    expect([...component.chosenExperts()]).toEqual([1, 3]);
    component.toggleCandidate(waiting);
    component.toggleCandidate(waiting);
    expect([...component.chosenExperts()]).toEqual([1, 3]);
    component.toggleCandidate(waiting);
    component.saveProjectExperts();
    expect(api.saveProjectExperts).toHaveBeenCalledWith(42, {
      revision: "v1",
      projectIds: [10],
      expertIds: [1],
      mode: "replace",
    });
  });
  it("лимит назначений не ограничивает пул экспертов для автоматического распределения", () => {
    const { component } = setup();
    const extra = { ...snapshot.experts[0], id: 3 };
    component.snapshot.update(s => ({
      ...s!,
      requiredEvaluators: 1,
      experts: [...s!.experts, extra],
    }));
    component.open("auto");
    component.openPool("Сбер");
    expect(component.chosenExperts().size).toBe(0);
    expect(component.candidateReason(extra)).toBeNull();
    component.toggleCandidate(snapshot.experts[0]);
    component.toggleCandidate(extra);
    expect(component.chosenExperts().size).toBe(2);
  });
  it("сохраняет несколько кейсов с ревизией программы", () => {
    const { component, api } = setup();
    component.openScope(snapshot.experts[0]);
    component.toggleScope("Т-Банк");
    expect(component.scopeAll()).toBe(false);
    expect([...component.scopeCases()]).toEqual(["Сбер"]);
    component.saveScope();
    expect(api.saveCaseScope).toHaveBeenCalledWith(42, 1, {
      revision: "v1",
      allCases: false,
      caseNames: ["Сбер"],
    });
  });
  it("не приглашает эксперта без выбора кейса и позволяет исправить выбор до принятия", () => {
    const { component, api } = setup();
    component.open("invite");
    component.email.setValue("expert@example.com");
    component.sendInvite();
    expect(api.invite).not.toHaveBeenCalled();
    expect(component.dialogError()).toContain("кейс");
    component.openScope(snapshot.experts[1]);
    component.toggleScope("Т-Банк");
    component.saveScope();
    expect(api.saveInvitationCaseScope).toHaveBeenCalledWith(42, 2, {
      revision: "v1",
      allCases: false,
      caseNames: ["Сбер"],
    });
    expect(api.saveCaseScope).not.toHaveBeenCalled();
  });
});
