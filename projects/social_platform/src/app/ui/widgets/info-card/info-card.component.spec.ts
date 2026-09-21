/** @format */

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
import { ButtonComponent, IconComponent } from "@ui/primitives";
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
  });

  afterEach(() => vi.restoreAllMocks());
  const card = (): HTMLElement => fixture.nativeElement.querySelector(".card__body");

  it.each(myProjectCardFixtures)("$key: один статус, CTA и прежний маршрут", async item => {
    const original = JSON.stringify(item.project);
    fixture.componentRef.setInput("info", item.project);
    fixture.detectChanges();
    expect(card().querySelectorAll(".card__status")).toHaveLength(1);
    expect(card().querySelector(".card__status")?.textContent?.trim()).toBe(item.label);
    expect(card().querySelector("button")?.textContent?.trim()).toBe(item.action);
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
    expect(fixture.debugElement.query(By.directive(ButtonComponent)).componentInstance.size()).toBe(
      "extra-small",
    );

    const router = TestBed.inject(Router);
    const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
    expect(router.serializeUrl(link.urlTree!)).toBe(AppRoutes.projects.detail(item.project.id));
    const navigate = vi.spyOn(router, "navigateByUrl").mockResolvedValue(true);
    card().querySelector("button")!.click();
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalled();
    expect(router.serializeUrl(navigate.mock.calls[0][0] as UrlTree)).toBe(
      AppRoutes.projects.detail(item.project.id),
    );
    expect(JSON.stringify(item.project)).toBe(original);
    expect(addSubscription.execute).not.toHaveBeenCalled();
    expect(deleteSubscription.execute).not.toHaveBeenCalled();
  });

  it("сдача имеет приоритет над draft и открывает проект", () => {
    fixture.componentRef.setInput(
      "info",
      projectCardFixture({ draft: true, partnerProgram: projectCardProgram(true) }),
    );
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent).toBe("Сдан на проверку");
    expect(card().querySelector("button")?.textContent?.trim()).toBe("Открыть");
  });

  it("draft имеет приоритет над обычной связью с программой", () => {
    fixture.componentRef.setInput(
      "info",
      projectCardFixture({ draft: true, partnerProgram: projectCardProgram(false) }),
    );
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent).toBe("Черновик");
    expect(card().querySelector("button")?.textContent?.trim()).toBe("Продолжить");
    component.programProjectHovered = true;
    component.iconHovered = true;
    fixture.detectChanges();
    expect(card().querySelector(".card__info--project-partner")).toBeNull();
    expect(card().textContent).not.toContain("привязан к программе");
  });

  it("отсутствующая связь не превращает опубликованный проект в программный", () => {
    fixture.componentRef.setInput("info", projectCardFixture({ partnerProgram: undefined }));
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent).toBe("Опубликован");
  });

  it("обновляет статус при замене данных и убирает его при смене appearance", () => {
    fixture.componentRef.setInput("info", myProjectCardFixtures[0].project);
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent).toBe("Черновик");
    fixture.componentRef.setInput("info", myProjectCardFixtures[3].project);
    fixture.detectChanges();
    expect(card().querySelector(".card__status")?.textContent).toBe("Сдан на проверку");
    fixture.componentRef.setInput("appereance", "subs");
    fixture.detectChanges();
    expect(card().querySelector(".card__status")).toBeNull();
    expect(fixture.nativeElement.querySelector(".card--my-project")).toBeNull();
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
    "%s сохраняет отрасль, truncate, мини-иконки и CTA",
    appearance => {
      const project = projectCardFixture({
        draft: true,
        partnerProgram: projectCardProgram(false),
      });
      fixture.componentRef.setInput("info", project);
      fixture.componentRef.setInput("appereance", appearance);
      fixture.detectChanges();
      expect(card().querySelector(".card__status")).toBeNull();
      expect(fixture.nativeElement.querySelector(".card--my-project")).toBeNull();
      expect(card().querySelector(".card__name")?.textContent).toContain(project.name.slice(0, 12));
      expect(card().querySelector(".card__name")?.textContent).not.toBe(project.name);
      expect(card().querySelector(".card__industry")?.textContent).toContain("Образование");
      expect(card().querySelectorAll(".card__info--program-icon")).toHaveLength(2);
      expect(card().querySelector("button")?.textContent?.trim()).toBe("проект");
      expect(!!card().querySelector(".card__info--vacancies")).toBe(appearance === "base");
      expect(!!card().querySelector(".card__info--collaborators")).toBe(appearance === "base");
    },
  );

  it.each(["invite", "members", "rating"] as const)("не оформляет %s как мой проект", type => {
    fixture.componentRef.setInput("type", type);
    fixture.detectChanges();
    expect(card().querySelector(".card__status")).toBeNull();
    expect(fixture.nativeElement.querySelector(".card--my-project")).toBeNull();
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
