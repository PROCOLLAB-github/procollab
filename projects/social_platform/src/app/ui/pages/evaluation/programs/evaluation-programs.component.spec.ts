/** @format */
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from "@angular/router";
import { BehaviorSubject, of, Subject, throwError } from "rxjs";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { ExpertCabinet } from "@domain/program/evaluation-workspace.model";
import { EvaluationProgramsComponent } from "./evaluation-programs.component";

const payload = (): ExpertCabinet => ({
  hasAccess: true,
  results: [
    {
      id: 7,
      name: "Первая программа",
      imageAddress: null,
      datetimeEvaluationEnds: null,
      status: "joined",
      assigned: 2,
      remaining: 1,
      completed: 1,
    },
    {
      id: 8,
      name: "Приглашение",
      imageAddress: null,
      datetimeEvaluationEnds: null,
      status: "pending",
      email: "expert@example.test",
      invitationId: 19,
    },
  ],
  projects: {
    count: 1,
    limit: 20,
    offset: 0,
    pending: 1,
    completed: 1,
    unavailable: 0,
    results: [
      {
        assignmentId: 1,
        projectId: 42,
        programId: 7,
        name: "Проект Альфа",
        caseName: "Кейс А",
        isCompleted: false,
        canRate: true,
        blockedReason: null,
      },
    ],
  },
});
function setup(initial: Record<string, string> = {}, response = of(payload())) {
  const params = new BehaviorSubject(convertToParamMap(initial));
  const profile = signal({ id: 10 });
  const profiles = { profile, applyProfileUpdated: vi.fn(), invalidateProfile: vi.fn() };
  const api = {
    cabinet: vi.fn(() => response),
    acceptOwn: vi.fn(() => of({ accepted: true, programId: 8 })),
  };
  const auth = { fetchProfile: vi.fn(() => of({ id: 10 })) };
  TestBed.configureTestingModule({
    imports: [EvaluationProgramsComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { queryParamMap: params, snapshot: { queryParamMap: params.value } },
      },
      { provide: EvaluationUseCase, useValue: api },
      { provide: ProfileInfoService, useValue: profiles },
      { provide: AuthInfoService, useValue: auth },
    ],
  });
  const router = TestBed.inject(Router);
  const navigate = vi.spyOn(router, "navigate").mockResolvedValue(true);
  const fixture = TestBed.createComponent(EvaluationProgramsComponent);
  fixture.detectChanges();
  return { fixture, c: fixture.componentInstance, api, params, profile, profiles, auth, navigate };
}

describe("Кабинет эксперта: только реальные назначения", () => {
  it.each([
    [false, 0, "Пока нет программ для оценки"],
    [true, 0, "Все проекты оценены"],
  ])("различает отсутствие доступа и завершение работы (%s)", (hasAccess, unavailable, text) => {
    const data = payload();
    data.hasAccess = hasAccess;
    data.projects = {
      ...data.projects,
      results: [],
      count: 0,
      pending: 0,
      completed: hasAccess ? 1 : 0,
      unavailable,
    };
    if (!hasAccess) data.results = [];
    const { fixture } = setup({}, of(data));
    expect(fixture.nativeElement.textContent).toContain(text);
  });
  it("открывает конкретный назначенный проект в существующей форме и выводит серверные счетчики", () => {
    const { fixture, api } = setup();
    expect(api.cabinet).toHaveBeenCalledWith({
      status: "pending",
      q: "",
      programId: undefined,
      limit: 20,
      offset: 0,
    });
    const link = fixture.nativeElement.querySelector(".cabinet__project a") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toContain("/office/program/7/projects-rating/42?returnUrl=");
    expect(fixture.nativeElement.textContent).toContain("Осталось 1 из 2");
    expect(fixture.nativeElement.textContent).not.toContain("Продолжить");
  });
  it("серверные поиск, программа, страница и завершенные проекты восстанавливаются из URL", () => {
    const { c, api } = setup({ tab: "completed", q: "Альфа", program: "7", page: "3" });
    expect(api.cabinet).toHaveBeenCalledWith({
      status: "completed",
      q: "Альфа",
      programId: 7,
      limit: 20,
      offset: 40,
    });
    expect(c.search.value).toBe("Альфа");
    expect(c.program.value).toBe("7");
  });
  it("смена фильтра отменяет старый запрос и не принимает устаревший результат", () => {
    const first = new Subject<ExpertCabinet>();
    const { c, api, params, fixture } = setup({}, first);
    const next = payload();
    next.projects.results[0].name = "Новый результат";
    api.cabinet.mockReturnValue(of(next));
    params.next(convertToParamMap({ q: "Новый" }));
    fixture.detectChanges();
    expect(first.observed).toBe(false);
    first.next(payload());
    fixture.detectChanges();
    expect(c.data()?.projects.results[0].name).toBe("Новый результат");
  });
  it("при смене аккаунта немедленно скрывает чужие данные и отменяет запрос", () => {
    const { c, api, profile, fixture } = setup();
    const delayed = new Subject<ExpertCabinet>();
    api.cabinet.mockReturnValue(delayed);
    profile.set({ id: 20 });
    expect(c.data()).toBeNull();
    fixture.detectChanges();
    expect(c.selected()).toBeNull();
    profile.set({ id: 0 });
    fixture.detectChanges();
    expect(delayed.observed).toBe(false);
    expect(c.data()).toBeNull();
  });
  it("не предлагает оценивать просроченный проект, но разрешает просмотр завершенного", () => {
    const data = payload();
    data.projects.results[0].canRate = false;
    data.projects.results[0].blockedReason = "Срок оценивания завершен";
    const { fixture, params, api } = setup({}, of(data));
    expect(fixture.nativeElement.querySelector(".cabinet__project button").disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain("Срок оценивания завершен");
    data.projects.results[0].isCompleted = true;
    api.cabinet.mockReturnValue(of(data));
    params.next(convertToParamMap({ tab: "completed" }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".cabinet__project a").textContent).toContain(
      "Посмотреть",
    );
  });
  it("не показывает все оценено, если часть назначений недоступна", () => {
    const data = payload();
    data.projects = { ...data.projects, results: [], count: 0, pending: 0, unavailable: 1 };
    const { fixture } = setup({}, of(data));
    expect(fixture.nativeElement.textContent).toContain("Пока нет доступных проектов");
    expect(fixture.nativeElement.textContent).not.toContain("Все проекты оценены");
  });
  it("сбой или старый API не превращает в успешный пустой кабинет", () => {
    const { fixture } = setup(
      {},
      of({ results: [], hasAccess: false } as unknown as ExpertCabinet),
    );
    expect(fixture.nativeElement.textContent).toContain("Не удалось загрузить кабинет");
    expect(fixture.nativeElement.textContent).not.toContain("Пока нет назначенных проектов");
  });
  it("401 ведет на вход с возвратом, другие ошибки можно повторить", () => {
    const { fixture } = setup(
      {},
      throwError(() => ({ status: 401 })),
    );
    expect(fixture.nativeElement.querySelector('a[href^="/auth/login"]')).toBeTruthy();
  });
  it("приглашение открывается по ссылке, отправляется однократно и обновляет профиль", () => {
    const { c, api, auth, profiles, fixture } = setup({ invitation: "19" });
    expect(c.selected()?.invitationId).toBe(19);
    const request = new Subject<{ accepted: boolean; programId: number }>();
    api.acceptOwn.mockReturnValue(request);
    c.accept();
    c.accept();
    expect(api.acceptOwn).toHaveBeenCalledTimes(1);
    c.close();
    expect(c.selected()).not.toBeNull();
    request.next({ accepted: true, programId: 8 });
    request.complete();
    fixture.detectChanges();
    expect(c.selected()).toBeNull();
    expect(auth.fetchProfile).toHaveBeenCalledOnce();
    expect(profiles.applyProfileUpdated).toHaveBeenCalledWith({ id: 10 });
  });
  it("не открывает чужое приглашение; ошибка принятия остается в модалке", () => {
    const { c, api } = setup({ invitation: "999" });
    expect(c.selected()).toBeNull();
    c.open(payload().results[1]);
    api.acceptOwn.mockReturnValue(throwError(() => ({ status: 409 })));
    c.accept();
    expect(c.error()).toBeTruthy();
    expect(c.busy()).toBe(false);
    expect(c.selected()).not.toBeNull();
  });
  it("смена вкладки и программы сбрасывает страницу, сохраняя остальные параметры", () => {
    const { c, navigate } = setup({ page: "3", q: "Альфа" });
    c.setTab("completed");
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({
        queryParams: { tab: "completed", page: null },
        queryParamsHandling: "merge",
      }),
    );
    c.program.setValue("7");
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ queryParams: { program: "7", page: null } }),
    );
  });
});
