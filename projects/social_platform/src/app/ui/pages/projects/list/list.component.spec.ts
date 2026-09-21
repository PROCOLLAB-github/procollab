/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { of } from "rxjs";
import { ProjectsListComponent } from "./list.component";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import { projectCardFixture } from "@ui/widgets/info-card/info-card.fixture";
import { ProjectsListInfoService } from "@api/project/facades/list/projects-list-info.service";
import { ProjectsInfoService } from "@api/project/facades/projects-info.service";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { SwipeService } from "@api/swipe/swipe.service";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { ok } from "@domain/shared/result.type";

/** Проверяем реальную разметку списка и идентичность карточек при обновлении массива. */
describe("ProjectsListComponent: контекст и track", () => {
  const first = projectCardFixture({ id: 101, inviteId: 0 });
  const second = projectCardFixture({ id: 102, inviteId: 0 });
  const projects = signal([first, second]);
  const office = { onAcceptInvite: vi.fn(), onRejectInvite: vi.fn() };
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    vi.clearAllMocks();
    projects.set([first, second]);
    const routeIs = (section: string) => TestBed.inject(Router).url.endsWith("/" + section);
    await TestBed.configureTestingModule({
      imports: [ProjectsListComponent],
      providers: [
        provideRouter([{ path: "office/projects/:section", component: ProjectsListComponent }]),
        {
          provide: IndustryRepositoryPort,
          useValue: { getOne: () => ({ id: 1, name: "Образование" }) },
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
      .overrideComponent(ProjectsListComponent, {
        set: {
          providers: [
            {
              provide: ProjectsListInfoService,
              useValue: { projects, initializationProjectsList: vi.fn(), initScroll: vi.fn() },
            },
            {
              provide: ProjectsInfoService,
              useValue: {
                isMy: () => routeIs("my"),
                isSubs: () => routeIs("subscriptions"),
                isAll: () => routeIs("all"),
                isInvites: () => routeIs("invites"),
              },
            },
            {
              provide: ProgramDetailListUIInfoService,
              useValue: { profileProjSubsIds: signal([101]) },
            },
            { provide: OfficeInfoService, useValue: office },
            { provide: SwipeService, useValue: { isFilterOpen: signal(false) } },
          ],
        },
      })
      .compileComponents();
    harness = await RouterTestingHarness.create();
  });

  const cards = () => harness.routeDebugElement!.queryAll(By.directive(InfoCardComponent));

  it.each([
    ["my", "my"],
    ["subscriptions", "subs"],
    ["all", "base"],
  ] as const)("/%s явно передаёт %s и сохраняет ID действия", async (route, appearance) => {
    await harness.navigateByUrl("/office/projects/" + route, ProjectsListComponent);
    harness.detectChanges();
    expect(cards()).toHaveLength(2);
    for (const [index, element] of cards().entries()) {
      const card = element.componentInstance as InfoCardComponent;
      expect(card.appereance()).toBe(appearance);
      expect(card.type()).toBe("projects");
      expect(card.profileId()).toBe(projects()[index].id);
      expect(card.showSubscriptionAction()).toBe(route !== "my");
    }
  });

  it("обычные проекты с одинаковым inviteId сохраняют DOM по project.id", async () => {
    await harness.navigateByUrl("/office/projects/my", ProjectsListComponent);
    harness.detectChanges();
    const before = cards().map(c => c.nativeElement);
    projects.set([{ ...second, name: "Обновлённый второй" }, { ...first }]);
    harness.detectChanges();
    expect(cards()[0].nativeElement).toBe(before[1]);
    expect(cards()[1].nativeElement).toBe(before[0]);
    expect(cards()[0].nativeElement.textContent).toContain("Обновлённый второй");
  });

  it("приглашения одного проекта используют inviteId и прежние действия", async () => {
    const invite1 = { ...first, inviteId: 51 };
    const invite2 = { ...first, inviteId: 52 };
    projects.set([invite1, invite2]);
    await harness.navigateByUrl("/office/projects/invites", ProjectsListComponent);
    harness.detectChanges();
    const before = cards().map(c => c.nativeElement);
    expect(cards().every(c => c.componentInstance.type() === "invite")).toBe(true);
    expect(cards().every(c => !c.componentInstance.showSubscriptionAction())).toBe(true);
    projects.set([{ ...invite2 }, { ...invite1 }]);
    harness.detectChanges();
    expect(cards()[0].nativeElement).toBe(before[1]);
    expect(cards()[1].nativeElement).toBe(before[0]);
    const buttons = cards()[0].nativeElement.querySelectorAll(".card__invite-actions button");
    buttons[0].click();
    buttons[1].click();
    expect(office.onAcceptInvite).toHaveBeenCalledWith(52);
    expect(office.onRejectInvite).toHaveBeenCalledWith(52);
    expect(TestBed.inject(Router).url).toBe("/office/projects/invites");
  });
});
