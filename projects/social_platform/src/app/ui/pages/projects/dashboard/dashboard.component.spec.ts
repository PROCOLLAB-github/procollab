/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router, RouterLink } from "@angular/router";
import { of } from "rxjs";
import { DashboardProjectsComponent } from "./dashboard.component";
import { DashboardItemComponent } from "./dashboardItem/dashboardItem.component";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import {
  myProjectCardFixtures,
  publicProjectCardFixtures,
} from "@ui/widgets/info-card/info-card.fixture";
import { ProjectsDashboardInfoService } from "@api/project/facades/dashboard/projects-dashboard-info.service";
import { ProjectsDashboardUIInfoService } from "@api/project/facades/dashboard/ui/projects-dashboard-ui-info.service";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { ok } from "@domain/shared/result.type";
import { DashboardItem } from "@utils/dashboardItemBuilder";

/** Дашборд использует те же карточки и контексты, что и полный список. */
describe("ProjectsDashboard: контексты карточек", () => {
  const items = signal<DashboardItem[]>([]);
  const dashboard = { initializationDashboardItems: vi.fn(), addProject: vi.fn() };
  beforeEach(async () => {
    vi.clearAllMocks();
    items.set([
      {
        sectionName: "my",
        title: "мои проекты",
        iconName: "main",
        arrayItems: myProjectCardFixtures.map(x => x.project),
      },
      {
        sectionName: "subscriptions",
        title: "мои подписки",
        iconName: "favourities",
        arrayItems: publicProjectCardFixtures,
      },
      {
        sectionName: "all",
        title: "витрина проектов",
        iconName: "folders",
        arrayItems: publicProjectCardFixtures,
      },
    ]);
    await TestBed.configureTestingModule({
      imports: [DashboardProjectsComponent, DashboardItemComponent],
      providers: [
        provideRouter([]),
        {
          provide: IndustryRepositoryPort,
          useValue: { getOne: (id: number) => ({ id, name: "Отрасль " + id }) },
        },
        {
          provide: AddProjectSubscriptionUseCase,
          useValue: { execute: vi.fn(() => of(ok(undefined))) },
        },
        {
          provide: DeleteProjectSubscriptionUseCase,
          useValue: { execute: vi.fn(() => of(ok(undefined))) },
        },
      ],
    })
      .overrideComponent(DashboardProjectsComponent, {
        set: {
          providers: [
            { provide: ProjectsDashboardInfoService, useValue: dashboard },
            { provide: ProjectsDashboardUIInfoService, useValue: { dashboardItems: items } },
            {
              provide: ProgramDetailListUIInfoService,
              useValue: { profileProjSubsIds: signal(publicProjectCardFixtures.map(x => x.id)) },
            },
          ],
        },
      })
      .compileComponents();
  });

  it("передаёт my/subs/base, ID и подписки; показывает нужный контекст каждого раздела", () => {
    const fixture = TestBed.createComponent(DashboardProjectsComponent);
    fixture.detectChanges();
    const sections = fixture.debugElement.queryAll(By.directive(DashboardItemComponent));
    expect(sections).toHaveLength(3);
    for (const [index, section] of sections.entries()) {
      const appearance = ["my", "subs", "base"][index];
      const cards = section.queryAll(By.directive(InfoCardComponent));
      expect(cards).toHaveLength(4);
      cards.forEach((el, i) => {
        const c = el.componentInstance as InfoCardComponent;
        expect(c.appereance()).toBe(appearance);
        expect(c.profileId()).toBe(c.info().id);
        if (index === 0) {
          expect(el.nativeElement.querySelector(".card__status").textContent).toBe(
            myProjectCardFixtures[i].label,
          );
          expect(el.nativeElement.querySelector(".card__context--industry")).toBeNull();
        } else {
          expect(c.isSubscribed).toBe(true);
          expect(el.nativeElement.querySelector(".card__status")).toBeNull();
          expect(!!el.nativeElement.querySelector(".card__context--industry")).toBe(i !== 3);
          expect(
            el.nativeElement.querySelector(".card__project-action-label").textContent.trim(),
          ).toBe("Открыть");
        }
      });
      const sectionLink = section.query(By.css(".dashboard__link")).injector.get(RouterLink);
      expect(TestBed.inject(Router).serializeUrl(sectionLink.urlTree!)).toBe(
        "/office/projects/" + ["my", "subscriptions", "all"][index],
      );
    }
    expect(dashboard.initializationDashboardItems).toHaveBeenCalledOnce();
  });

  it("определяет контекст по разделу, даже если декоративная иконка другая", () => {
    const fixture = TestBed.createComponent(DashboardItemComponent);
    fixture.componentRef.setInput("title", "Раздел");
    fixture.componentRef.setInput("iconName", "folders");
    fixture.componentRef.setInput("sectionName", "my");
    fixture.componentRef.setInput("arrayItems", [myProjectCardFixtures[0].project]);
    fixture.detectChanges();
    const card = () =>
      fixture.debugElement.query(By.directive(InfoCardComponent))
        .componentInstance as InfoCardComponent;
    expect(card().appereance()).toBe("my");
    fixture.componentRef.setInput("sectionName", "subscriptions");
    fixture.detectChanges();
    expect(card().appereance()).toBe("subs");
  });

  it("пустой раздел сохраняет действие создания", () => {
    items.set([{ sectionName: "my", title: "мои проекты", iconName: "main", arrayItems: [] }]);
    const fixture = TestBed.createComponent(DashboardProjectsComponent);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.directive(InfoCardComponent));
    expect(card.componentInstance.appereance()).toBe("empty");
    card.nativeElement.querySelector(".card__body").click();
    expect(dashboard.addProject).toHaveBeenCalledOnce();
  });
});
