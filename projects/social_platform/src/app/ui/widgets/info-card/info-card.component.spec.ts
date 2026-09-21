/** @format */

import { OverlayContainer } from "@angular/cdk/overlay";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router, RouterLink, UrlTree } from "@angular/router";
import { of } from "rxjs";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { ok } from "@domain/shared/result.type";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { IconComponent } from "@ui/primitives";
import { InfoCardComponent } from "./info-card.component";
import { myProjectCardFixtures, projectCardFixture, projectCardProgram } from "./info-card.fixture";

describe("InfoCardComponent: статусы моих проектов", () => {
  let fixture: ComponentFixture<InfoCardComponent>;
  let component: InfoCardComponent;
  const addSubscription = { execute: vi.fn(() => of(ok(undefined))) };
  const deleteSubscription = { execute: vi.fn(() => of(ok(undefined))) };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [InfoCardComponent],
      providers: [
        {
          provide: IndustryRepositoryPort,
          useValue: { industries: () => [], getOne: () => ({ id: 1, name: "Образование" }) },
        },
        { provide: AddProjectSubscriptionUseCase, useValue: addSubscription },
        { provide: DeleteProjectSubscriptionUseCase, useValue: deleteSubscription },
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(InfoCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("info", projectCardFixture());
    fixture.componentRef.setInput("type", "projects");
    fixture.componentRef.setInput("appereance", "my");
    fixture.componentRef.setInput("loggedUserId", 7);
  });

  afterEach(async () => {
    // CDK прикрепляет/открепляет portal в следующем такте; завершаем его до teardown.
    await new Promise(resolve => setTimeout(resolve, 0));
    vi.restoreAllMocks();
  });
  const card = (): HTMLElement => fixture.nativeElement.querySelector(".card__body");

  it.each(myProjectCardFixtures)(
    "$key / $role: статус, доступ и единственный корректный маршрут",
    async item => {
      const original = JSON.stringify(item.project);
      fixture.componentRef.setInput("info", item.project);
      fixture.detectChanges();
      expect(card().querySelectorAll(".card__status")).toHaveLength(1);
      expect(
        card()
          .querySelector(".card__status")
          ?.classList.contains("card__status--" + item.key),
      ).toBe(true);
      expect(card().querySelector(".card__status")?.textContent?.trim()).toBe(item.label);
      expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
        item.action,
      );
      expect(card().querySelector(".card__name")?.textContent).toBe(item.project.name);
      expect(
        card().querySelector(
          ".card__info--vacancies, .card__info--collaborators, .card__info--program-icon, .card__industry, .card__info--project-partner",
        ),
      ).toBeNull();
      expect(fixture.debugElement.queryAll(By.directive(IconComponent))).toHaveLength(0);
      const avatar = fixture.debugElement.query(By.directive(AvatarComponent)).componentInstance;
      expect(avatar.size()).toBe(70);
      expect(avatar.url()).toBe(item.project.imageAddress);
      const router = TestBed.inject(Router);
      const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
      expect(card().querySelector(".card__role")?.textContent).toBe(item.role);
      expect(card().querySelector(".card__access-label")?.textContent).toBe(item.access);
      const expectedRoute = AppRoutes.projects.detail(item.project.id);
      expect(router.serializeUrl(link.urlTree!)).toBe(expectedRoute);
      expect(link.urlTree!.queryParams).toEqual({});
      expect(card().querySelectorAll("a")).toHaveLength(1);
      expect(card().querySelector("a a, a button, a [tabindex]")).toBeNull();
      const navigate = vi.spyOn(router, "navigateByUrl").mockResolvedValue(true);
      card().querySelector<HTMLElement>(".card__project-action")!.click();
      await fixture.whenStable();
      expect(navigate).toHaveBeenCalledOnce();
      expect(router.serializeUrl(navigate.mock.calls[0][0] as UrlTree)).toBe(expectedRoute);
      navigate.mockClear();
      card().querySelector<HTMLElement>(".card__name")!.click();
      expect(navigate).toHaveBeenCalledOnce();
      expect(router.serializeUrl(navigate.mock.calls[0][0] as UrlTree)).toBe(expectedRoute);
      expect(JSON.stringify(item.project)).toBe(original);
      expect(addSubscription.execute).not.toHaveBeenCalled();
      expect(deleteSubscription.execute).not.toHaveBeenCalled();
    },
  );

  it.each([7, 99])("сдача имеет приоритет над draft для пользователя %s", userId => {
    fixture.componentRef.setInput("loggedUserId", userId);
    fixture.componentRef.setInput(
      "info",
      projectCardFixture({ draft: true, partnerProgram: projectCardProgram(true) }),
    );
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent?.trim()).toBe("Сдан в программу");
    expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
      "Открыть",
    );
    expect(card().querySelector(".card__role")?.textContent).toBe(
      userId === 7 ? "Лидер" : "Участник",
    );
    expect(card().querySelector(".card__access-label")?.textContent).toBe("только просмотр");
    const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
    expect(link.urlTree!.queryParams).toEqual({});
    expect(TestBed.inject(Router).serializeUrl(link.urlTree!)).toBe(AppRoutes.projects.detail(101));
  });

  it.each(myProjectCardFixtures.slice(0, 4))(
    "$key: смена роли или отсутствие профиля не меняет lifecycle и CTA",
    item => {
      fixture.componentRef.setInput("info", item.project);
      for (const userId of [7, 99, undefined]) {
        fixture.componentRef.setInput("loggedUserId", userId);
        fixture.detectChanges();
        expect(card().querySelector(".card__status")?.textContent?.trim()).toBe(item.label);
        expect(card().querySelector(".card__role")?.textContent).toBe(
          userId === 7 ? "Лидер" : "Участник",
        );
        expect(card().querySelector(".card__access-label")?.textContent).toBe(
          userId === 7 ? item.access : "только просмотр",
        );
        expect(card().querySelector(".card__project-action")?.textContent?.trim()).toBe("Открыть");
        const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
        expect(TestBed.inject(Router).serializeUrl(link.urlTree!)).toBe(
          AppRoutes.projects.detail(item.project.id),
        );
        expect(link.urlTree!.queryParams).toEqual({});
      }
    },
  );

  it("отсутствующие ID безопасны, а загрузка/смена пользователя обновляет доступ", () => {
    fixture.componentRef.setInput("info", projectCardFixture({ leader: undefined }));
    fixture.componentRef.setInput("loggedUserId", undefined);
    fixture.detectChanges();
    expect(card().querySelector(".card__role")?.textContent).toBe("Участник");
    expect(card().querySelector(".card__access-label")?.textContent).toBe("только просмотр");
    expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
      "Открыть",
    );
    fixture.componentRef.setInput("info", projectCardFixture({ leader: 7 }));
    fixture.detectChanges();
    expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
      "Открыть",
    );
    fixture.componentRef.setInput("loggedUserId", 7);
    fixture.detectChanges();
    expect(card().querySelector(".card__role")?.textContent).toBe("Лидер");
    expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
      "Открыть",
    );
    fixture.componentRef.setInput("loggedUserId", undefined);
    fixture.detectChanges();
    expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
      "Открыть",
    );
  });

  it("canSubmit не подменяет факт сдачи", () => {
    fixture.componentRef.setInput(
      "info",
      projectCardFixture({
        partnerProgram: { ...projectCardProgram(false), canSubmit: false },
      }),
    );
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent?.trim()).toBe("В программе");
    expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
      "Открыть",
    );
  });

  it("draft имеет приоритет над обычной связью с программой", () => {
    fixture.componentRef.setInput(
      "info",
      projectCardFixture({ draft: true, partnerProgram: projectCardProgram(false) }),
    );
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent?.trim()).toBe("Черновик");
    expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
      "Открыть",
    );
    fixture.detectChanges();
    expect(card().querySelector(".card__info--project-partner")).toBeNull();
    expect(card().textContent).not.toContain("привязан к программе");
  });

  it("отсутствующая связь не превращает опубликованный проект в программный", () => {
    fixture.componentRef.setInput("info", projectCardFixture({ partnerProgram: undefined }));
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent?.trim()).toBe("Опубликован");
  });

  it("обновляет статус при замене данных и убирает его при смене appearance", () => {
    fixture.componentRef.setInput("info", myProjectCardFixtures[0].project);
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent?.trim()).toBe("Черновик");
    fixture.componentRef.setInput("info", myProjectCardFixtures[3].project);
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent?.trim()).toBe("Сдан в программу");
    fixture.componentRef.setInput("appereance", "subs");
    fixture.detectChanges();
    expect(card().querySelector(".card__status")).toBeNull();
    expect(fixture.nativeElement.querySelector(".card--project")).not.toBeNull();
  });

  it("сохраняет полное название и описание в DOM для двухстрочного CSS-ограничения", () => {
    const project = projectCardFixture({
      name: "ОченьДлинноеНазваниеБезПробелов".repeat(4),
      shortDescription: "Очень длинное описание проекта. ".repeat(20),
    });
    fixture.componentRef.setInput("info", project);
    fixture.detectChanges();
    expect(card().querySelector(".card__name")?.textContent).toBe(project.name);
    expect(card().querySelector(".card__description")?.textContent?.trim()).toBe(
      project.shortDescription.trim(),
    );
  });

  it.each(["base", "subs"] as const)(
    "%s: отрасль, полный текст, Открыть и отсутствие lifecycle/шума",
    appearance => {
      const project = projectCardFixture({ draft: true, partnerProgram: projectCardProgram(true) });
      fixture.componentRef.setInput("info", project);
      fixture.componentRef.setInput("appereance", appearance);
      fixture.detectChanges();
      expect(card().querySelector(".card__status")).toBeNull();
      expect(card().querySelector(".card__access")).toBeNull();
      expect(fixture.nativeElement.querySelector(".card--project")).not.toBeNull();
      expect(card().querySelector(".card__name")?.textContent).toBe(project.name);
      expect(card().querySelector(".card__context--industry")?.textContent?.trim()).toBe(
        "Образование",
      );
      expect(card().querySelector<HTMLElement>(".card__project-action")?.textContent?.trim()).toBe(
        "Открыть",
      );
      expect(
        card().querySelector(
          ".card__info--vacancies, .card__info--collaborators, .card__info--program-icon, .card__industry, .card__info--project-partner",
        ),
      ).toBeNull();
      const router = TestBed.inject(Router);
      const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
      expect(router.serializeUrl(link.urlTree!)).toBe(AppRoutes.projects.detail(project.id));
    },
  );

  it.each(["base", "subs"] as const)("%s без отрасли не резервирует плашку", appearance => {
    fixture.componentRef.setInput("info", projectCardFixture({ industry: undefined }));
    fixture.componentRef.setInput("appereance", appearance);
    fixture.detectChanges();
    expect(card().querySelector(".card__context")).toBeNull();
    expect(card().querySelector(".card__name")?.textContent).toBe(projectCardFixture().name);
  });

  it("длинная отрасль доступна целиком в подсказке и с клавиатуры", () => {
    const name = "Очень длинное название отрасли проекта";
    vi.spyOn(TestBed.inject(IndustryRepositoryPort), "getOne").mockReturnValue({ id: 1, name });
    fixture.componentRef.setInput("appereance", "subs");
    fixture.detectChanges();
    const context = card().querySelector<HTMLElement>(".card__context--industry")!;
    expect(context.title).toBe(name);
    expect(context.textContent?.trim()).toBe(name);
    const link = card().querySelector<HTMLAnchorElement>(".card__project-link")!;
    expect(link.title).toBe(name);
    expect(link.tabIndex).toBe(0);
  });

  it.each(["base", "subs"] as const)(
    "%s: отдельное действие сохраняет сценарий отписки",
    async appearance => {
      fixture.componentRef.setInput("appereance", appearance);
      fixture.componentRef.setInput("showSubscriptionAction", true);
      fixture.componentRef.setInput("profileId", 101);
      fixture.componentRef.setInput("isSubscribed", true);
      fixture.detectChanges();
      const action = card().querySelector<HTMLButtonElement>(".card__subscription-action")!;
      expect(action.getAttribute("aria-label")).toBe("Отписаться от проекта");
      expect(action.type).toBe("button");
      expect(action.closest(".card__content, a")).toBeNull();
      const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
      action.click();
      fixture.detectChanges();
      expect(component.isUnsubscribeModalOpen).toBe(true);
      expect(deleteSubscription.execute).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      await new Promise(resolve => setTimeout(resolve, 0));
      await fixture.whenStable();
      TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector<HTMLButtonElement>(".unsubscribe-modal__buttons button")!
        .click();
      fixture.detectChanges();
      expect(deleteSubscription.execute).toHaveBeenCalledExactlyOnceWith(101);
      expect(component.isSubscribed).toBe(false);
      expect(component.isUnsubscribeModalOpen).toBe(false);
    },
  );

  it("подписка отправляет существующий use case с ID проекта", () => {
    fixture.componentRef.setInput("appereance", "base");
    fixture.componentRef.setInput("showSubscriptionAction", true);
    fixture.componentRef.setInput("profileId", 101);
    fixture.detectChanges();
    card().querySelector<HTMLButtonElement>(".card__subscription-action")!.click();
    fixture.detectChanges();
    expect(addSubscription.execute).toHaveBeenCalledExactlyOnceWith(101);
    expect(component.isSubscribed).toBe(true);
  });

  it.each(["invite", "members", "rating"] as const)("не оформляет %s как мой проект", type => {
    fixture.componentRef.setInput("showSubscriptionAction", true);
    fixture.componentRef.setInput("type", type);
    fixture.detectChanges();
    expect(card().querySelector(".card__status")).toBeNull();
    expect(card().querySelector(".card__access")).toBeNull();
    expect(fixture.nativeElement.querySelector(".card--project")).toBeNull();
  });

  it("сохраняет пустую карточку и действие создания", () => {
    fixture.componentRef.setInput("appereance", "empty");
    fixture.detectChanges();
    expect(card().querySelector(".card__status")).toBeNull();
    expect(fixture.nativeElement.querySelector(".card__empty")).not.toBeNull();
    expect(card().textContent).toContain("Создайте первый проект");
    const create = vi.fn();
    component.onCreate.subscribe(create);
    card().click();
    expect(create).toHaveBeenCalledOnce();
  });
});
