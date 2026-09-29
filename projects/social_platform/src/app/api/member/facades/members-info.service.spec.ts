/** @format */
import { TestBed } from "@angular/core/testing";
import { signal, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { NavService } from "@api/shared/nav.service";
import { NavigationService } from "@api/paths/navigation.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { GetMembersUseCase } from "../use-cases/get-members.use-case";
import { MembersUIInfoService } from "./ui/members-ui-info.service";
import { MembersInfoService } from "./members-info.service";
import { MembersResolver } from "@ui/pages/members/members.resolver";
import { ok } from "@domain/shared/result.type";
import { normalizeMemberSearch } from "../member-search";

const page = (ids: number[], count = ids.length) => ({
  count,
  next: "",
  previous: "",
  results: ids.map(id => ({ id })),
});

describe("Поиск участников", () => {
  const params = new BehaviorSubject<Record<string, string>>({});
  const execute = vi.fn();
  const navigate = vi.fn();
  let ui: MembersUIInfoService, service: MembersInfoService;
  const setup = (initialParams: Record<string, string> = { fullname: "  Иван  Иванов " }) => {
    params.next(initialParams);
    execute.mockReset().mockReturnValue(of(ok(page([1], 1))));
    navigate.mockReset().mockImplementation((_commands, options) => {
      const next = { ...params.value, ...options.queryParams };
      for (const key of Object.keys(next)) if (next[key] == null) delete next[key];
      params.next(next);
      return Promise.resolve(true);
    });
    TestBed.configureTestingModule({
      providers: [
        MembersInfoService,
        MembersUIInfoService,
        {
          provide: ActivatedRoute,
          useValue: {
            get snapshot() {
              return { queryParams: params.value };
            },
            queryParams: params,
            data: of({ data: page([1, 2], 100) }),
          },
        },
        { provide: Router, useValue: { navigate } },
        { provide: GetMembersUseCase, useValue: { execute } },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: NavigationService, useValue: {} },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
        { provide: ProfileInfoService, useValue: { profile: signal({ id: 7 }) } },
        {
          provide: ProfileDetailUIInfoService,
          useValue: { profileId: signal(7), applySetLoggedUserId: vi.fn() },
        },
      ],
    });
    ui = TestBed.inject(MembersUIInfoService);
    service = TestBed.inject(MembersInfoService);
    service.initializationMembers();
  };
  beforeEach(() => {
    vi.useFakeTimers();
    setup();
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it("нормализует пробелы без изменения регистра", () => {
    expect(normalizeMemberSearch("  иВан\t  Иванов  ")).toBe("иВан Иванов");
    expect(normalizeMemberSearch(null)).toBe("");
  });
  it("resolver передаёт все фильтры URL, включая false и возраст", () => {
    const queryParams = {
      fullname: "  Анна  ",
      skills__contains: "Angular",
      speciality__icontains: "Front-end",
      age: "18,30",
      is_mospolytech_student: "false",
    };
    TestBed.runInInjectionContext(() => MembersResolver({ queryParams } as any, {} as any));
    expect(execute).toHaveBeenLastCalledWith(0, 20, { ...queryParams, fullname: "Анна" });
  });
  it("начальная форма гидратируется из полного URL без навигации и второго запроса", async () => {
    TestBed.resetTestingModule();
    setup({
      fullname: "Анна",
      skills__contains: "Angular",
      speciality__icontains: "Front-end",
      age: "18,30",
      is_mospolytech_student: "true",
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(ui.filterForm.getRawValue()).toEqual({
      keySkill: "Angular",
      speciality: "Front-end",
      age: [18, 30],
      isMosPolytechStudent: true,
    });
    expect(ui.searchForm.controls.search.value).toBe("Анна");
    expect(ui.members().map(user => user.id)).toEqual([1, 2]);
    expect(navigate).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });
  it("асинхронные переходы сериализованы, поздний URL не стирает новую правку формы", async () => {
    let finish!: () => void;
    navigate.mockImplementationOnce(
      (_commands, options) =>
        new Promise<boolean>(resolve => {
          finish = () => {
            params.next(options.queryParams);
            resolve(true);
          };
        }),
    );
    ui.filterForm.patchValue({ keySkill: "Angular" });
    await vi.advanceTimersByTimeAsync(150);
    ui.filterForm.patchValue({ keySkill: "CSS", speciality: "Front-end" });
    ui.searchForm.patchValue({ search: "Анна" });
    await vi.advanceTimersByTimeAsync(400);
    expect(navigate).toHaveBeenCalledTimes(1);
    finish();
    await vi.advanceTimersByTimeAsync(1);
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenLastCalledWith(0, 20, {
      fullname: "Анна",
      skills__contains: "CSS",
      speciality__icontains: "Front-end",
    });
    expect(ui.filterForm.controls.keySkill.value).toBe("CSS");
    expect(ui.searchForm.controls.search.value).toBe("Анна");
  });
  it("Back отбрасывает очередь правок при незавершённой навигации", async () => {
    let finish!: (value: boolean) => void;
    navigate.mockImplementationOnce(
      () =>
        new Promise<boolean>(resolve => {
          finish = resolve;
        }),
    );
    ui.filterForm.patchValue({ keySkill: "SQL" });
    await vi.advanceTimersByTimeAsync(150);
    ui.filterForm.patchValue({ keySkill: "CSS" });
    await vi.advanceTimersByTimeAsync(150);
    params.next({ skills__contains: "Angular" });
    finish(false);
    await vi.advanceTimersByTimeAsync(500);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(ui.filterForm.controls.keySkill.value).toBe("Angular");
    expect(execute).toHaveBeenLastCalledWith(0, 20, { skills__contains: "Angular" });
  });
  it("Back/Forward восстанавливает все контролы без дополнительной навигации", async () => {
    params.next({
      fullname: "Анна",
      skills__contains: "Angular",
      speciality__icontains: "Front-end",
      age: "18,30",
      is_mospolytech_student: "false",
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(ui.searchForm.controls.search.value).toBe("Анна");
    expect(ui.filterForm.getRawValue()).toEqual({
      keySkill: "Angular",
      speciality: "Front-end",
      age: [18, 30],
      isMosPolytechStudent: false,
    });
    expect(navigate).not.toHaveBeenCalled();
    params.next({});
    await vi.advanceTimersByTimeAsync(500);
    expect(ui.searchForm.controls.search.value).toBe("");
    expect(ui.filterForm.getRawValue()).toEqual({
      keySkill: "",
      speciality: "",
      age: [null, null],
      isMosPolytechStudent: null,
    });
    expect(execute).toHaveBeenLastCalledWith(0, 20, {});
  });
  it("Back отменяет отложенное изменение поиска и фильтра", async () => {
    ui.searchForm.patchValue({ search: "Не отправлять" });
    ui.filterForm.patchValue({ keySkill: "SQL" });
    await vi.advanceTimersByTimeAsync(50);
    params.next({ skills__contains: "Angular" });
    await vi.advanceTimersByTimeAsync(600);
    expect(navigate).not.toHaveBeenCalled();
    expect(execute).toHaveBeenLastCalledWith(0, 20, { skills__contains: "Angular" });
  });
  it("сброс при уже пустом URL отменяет ввод даже без эмиссии Router", async () => {
    params.next({});
    navigate.mockImplementation(() => Promise.resolve(true));
    ui.searchForm.patchValue({ search: "Не отправлять" });
    ui.filterForm.patchValue({ keySkill: "SQL", age: [18, 30], isMosPolytechStudent: false });
    await vi.advanceTimersByTimeAsync(50);
    service.resetFilters();
    await vi.advanceTimersByTimeAsync(600);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][1].queryParams).toEqual({
      fullname: null,
      skills__contains: null,
      speciality__icontains: null,
      age: null,
      is_mospolytech_student: null,
    });
    expect(ui.searchForm.controls.search.value).toBe("");
    expect(ui.filterForm.getRawValue()).toEqual({
      keySkill: "",
      speciality: "",
      age: [null, null],
      isMosPolytechStudent: null,
    });
  });
  it("форма сохраняет возраст и false вместе с новым поиском", async () => {
    ui.filterForm.patchValue({ age: [18, 30], isMosPolytechStudent: false });
    ui.searchForm.patchValue({ search: "Анна" });
    await vi.advanceTimersByTimeAsync(500);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(0, 20, {
      fullname: "Анна",
      age: "18,30",
      is_mospolytech_student: "false",
    });
  });
  it("быстрый ввод отправляет последнюю строку, а очистка возвращает полный список", async () => {
    for (const value of ["И", "Ив", "Ива", "Иван Петров"]) {
      ui.searchForm.patchValue({ search: value });
      await vi.advanceTimersByTimeAsync(60);
    }
    await vi.advanceTimersByTimeAsync(450);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(0, 20, { fullname: "Иван Петров" });
    expect(ui.membersTotalCount()).toBe(1);
    ui.searchForm.patchValue({ search: "  Иван   Петров  " });
    await vi.advanceTimersByTimeAsync(450);
    expect(navigate).toHaveBeenCalledTimes(1);
    ui.searchForm.patchValue({ search: null });
    await vi.advanceTimersByTimeAsync(450);
    expect(execute).toHaveBeenLastCalledWith(0, 20, {});
  });
  it("поиск из URL виден в форме, resolver передаёт тот же fullname", () => {
    expect(ui.searchForm.controls.search.value).toBe("Иван Иванов");
    TestBed.runInInjectionContext(() =>
      MembersResolver({ queryParams: params.value } as any, {} as any),
    );
    expect(execute).toHaveBeenCalledWith(0, 20, { fullname: "Иван Иванов" });
  });
  it("сохраняет фильтры и отменяет устаревший поисковый запрос", async () => {
    const old = new Subject<any>();
    execute.mockReturnValueOnce(old);
    params.next({ fullname: "Иван", skills__contains: "SQL" });
    await vi.advanceTimersByTimeAsync(150);
    params.next({ fullname: "Пётр", skills__contains: "SQL" });
    await vi.advanceTimersByTimeAsync(150);
    old.next(ok(page([99])));
    expect(execute).toHaveBeenLastCalledWith(0, 20, { fullname: "Пётр", skills__contains: "SQL" });
    expect(ui.members().map(u => u.id)).toEqual([1]);
  });
  it("поздняя страница старого поиска не дописывается к новому", async () => {
    const old = new Subject<any>();
    execute.mockReturnValueOnce(old);
    const target = document.createElement("div"),
      root = document.createElement("ul");
    service.initScroll(target, new ElementRef(root));
    target.dispatchEvent(new Event("scroll"));
    expect(execute).toHaveBeenCalledWith(2, 20, { fullname: "Иван Иванов" });
    params.next({ fullname: "Анна" });
    await vi.advanceTimersByTimeAsync(150);
    old.next(ok(page([99])));
    old.complete();
    expect(ui.members().map(u => u.id)).toEqual([1]);
  });

  it("быстрые изменения фильтров передают последний полный набор одним переходом", async () => {
    ui.filterForm.patchValue({ keySkill: "Angular" });
    await vi.advanceTimersByTimeAsync(30);
    ui.filterForm.patchValue({ speciality: "Front-end" });
    await vi.advanceTimersByTimeAsync(30);
    ui.filterForm.patchValue({ keySkill: "CSS" });
    await vi.advanceTimersByTimeAsync(250);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(0, 20, {
      fullname: "Иван Иванов",
      skills__contains: "CSS",
      speciality__icontains: "Front-end",
    });
  });

  it("повторный выбор после общего сброса снова применяет ту же специальность", async () => {
    ui.filterForm.patchValue({ speciality: "Front-end" });
    await vi.advanceTimersByTimeAsync(350);
    ui.filterForm.reset(undefined, { emitEvent: false });
    params.next({});
    await vi.advanceTimersByTimeAsync(350);
    navigate.mockClear();
    ui.filterForm.patchValue({ speciality: "Front-end" });
    await vi.advanceTimersByTimeAsync(350);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(0, 20, {
      speciality__icontains: "Front-end",
    });
  });

  it("общий сброс во время debounce не восстанавливает отложенный фильтр", async () => {
    ui.filterForm.patchValue({ keySkill: "Angular", speciality: "Front-end" });
    await vi.advanceTimersByTimeAsync(50);
    ui.filterForm.reset(undefined, { emitEvent: false });
    params.next({});
    await vi.advanceTimersByTimeAsync(350);
    expect(execute).toHaveBeenLastCalledWith(0, 20, {});
  });
});
