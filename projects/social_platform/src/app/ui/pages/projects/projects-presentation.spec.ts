/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormGroup } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { ProjectsInfoService } from "@api/project/facades/projects-info.service";
import { ProjectsUIInfoService } from "@api/project/facades/ui/projects-ui-info.service";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { SwipeService } from "@api/swipe/swipe.service";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ok } from "@domain/shared/result.type";
import { projectCardFixture } from "@ui/widgets/info-card/info-card.fixture";
import { ProjectsComponent } from "./projects.component";

describe("ProjectsComponent: приглашение и активность на странице", () => {
  let section: string;
  const office = { onAcceptInvite: vi.fn(), onRejectInvite: vi.fn() };

  beforeEach(async () => {
    section = "dashboard";
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideRouter([]),
        { provide: OfficeInfoService, useValue: office },
        {
          provide: IndustryRepositoryPort,
          useValue: { industries: signal([{ id: 1, name: "Образование" }]) },
        },
        { provide: AddProjectSubscriptionUseCase, useValue: { execute: () => of(ok(undefined)) } },
        {
          provide: DeleteProjectSubscriptionUseCase,
          useValue: { execute: () => of(ok(undefined)) },
        },
      ],
    })
      .overrideComponent(ProjectsComponent, {
        set: {
          providers: [
            {
              provide: ProjectsInfoService,
              useValue: {
                isDashboard: () => section === "dashboard",
                isMy: () => section === "my",
                isSubs: () => section === "subscriptions",
                isInvites: () => section === "invites",
                isAll: () => section === "all",
                projectCount: signal({ my: 26, myLeader: 23, myInProgram: 1, mySubmitted: 4 }),
                projectCountState: signal("loaded"),
                initializationProjects: vi.fn(),
              },
            },
            {
              provide: ProjectsUIInfoService,
              useValue: {
                searchForm: new FormGroup({ search: new FormControl("") }),
                myInvites: signal([
                  projectCardFixture({ inviteId: 801, industry: 1, name: "Проект приглашения" }),
                ]),
              },
            },
            { provide: SwipeService, useValue: { isFilterOpen: signal(false) } },
          ],
        },
      })
      .compileComponents();
  });

  afterEach(async () => {
    // Завершаем отложенное прикрепление portal общей модалки до уничтожения TestBed.
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  it.each(["dashboard", "my", "subscriptions", "invites", "all"])(
    "сохраняет размещение активности в разделе %s",
    current => {
      section = current;
      const fixture = TestBed.createComponent(ProjectsComponent);
      fixture.detectChanges();
      const activity = fixture.nativeElement.querySelector("app-project-activity-card");
      if (current === "dashboard" || current === "my") {
        expect(activity.querySelector("h2").textContent.trim()).toBe("Моя активность");
        expect(
          Array.from(activity.querySelectorAll(".activity__value"), (node: unknown) =>
            (node as HTMLElement).textContent?.trim(),
          ),
        ).toEqual(["26", "23", "1", "4"]);
      } else {
        expect(activity).toBeNull();
      }
    },
  );

  it("приглашение справа не содержит отрасль и сохраняет оба действия", () => {
    const fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
    const invitation: HTMLElement = fixture.nativeElement.querySelector(
      ".page__invites app-info-card",
    );
    expect(invitation.textContent).not.toContain("Образование");
    expect(invitation.querySelector(".card__industry, .card__context--industry")).toBeNull();
    expect(invitation.querySelector(".card__name")?.textContent).toContain("Проект приглашения");
    const buttons = Array.from(invitation.querySelectorAll("button"));
    buttons.find(button => button.textContent?.trim() === "принять")!.click();
    buttons.find(button => button.textContent?.trim() === "отклонить")!.click();
    expect(office.onAcceptInvite).toHaveBeenCalledExactlyOnceWith(801);
    expect(office.onRejectInvite).toHaveBeenCalledExactlyOnceWith(801);
  });
});
