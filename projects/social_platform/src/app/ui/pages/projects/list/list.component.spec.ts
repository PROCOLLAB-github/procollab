/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectsListComponent } from "./list.component";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { signal } from "@angular/core";
import { initial } from "@domain/shared/async-state";
import { ProjectsListInfoService } from "@api/project/facades/list/projects-list-info.service";
import { ProjectsInfoService } from "@api/project/facades/projects-info.service";
import { ProgramDetailListInfoService } from "@api/program/facades/detail/program-detail-list-info.service";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { OfficeUIInfoService } from "@api/office/facades/ui/office-ui-info.service";
import { SwipeService } from "@api/swipe/swipe.service";

describe("ProjectsListComponent", () => {
  let component: ProjectsListComponent;
  let fixture: ComponentFixture<ProjectsListComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const projectsListInfoServiceSpy = jasmine.createSpyObj(
      "ProjectsListInfoService",
      ["initializationProjectsList", "initScroll", "destroy"],
      {
        projects: signal([]),
      },
    );

    const projectsInfoServiceSpy = {
      isAll: signal(false),
      isMy: signal(false),
      isSubs: signal(false),
      isInvites: signal(false),
    };

    const programDetailListUIInfoServiceSpy = {
      profileProjSubsIds: signal([]),
    };

    const officeInfoServiceSpy = jasmine.createSpyObj("OfficeInfoService", [
      "onAcceptInvite",
      "onRejectInvite",
    ]);

    const officeUIInfoServiceSpy = {};

    const swipeServiceSpy = {
      isFilterOpen: signal(false),
      onSwipeStart: jasmine.createSpy("onSwipeStart"),
      onSwipeMove: jasmine.createSpy("onSwipeMove"),
      onSwipeEnd: jasmine.createSpy("onSwipeEnd"),
      closeFilter: jasmine.createSpy("closeFilter"),
    };

    const programDetailListInfoServiceSpy = jasmine.createSpyObj("ProgramDetailListInfoService", [
      "init",
      "destroy",
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ProjectsListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
      ],
    })
      .overrideComponent(ProjectsListComponent, {
        remove: {
          providers: [
            ProjectsListInfoService,
            ProjectsInfoService,
            ProgramDetailListInfoService,
            ProgramDetailListUIInfoService,
            OfficeInfoService,
            OfficeUIInfoService,
            SwipeService,
          ],
        },
        add: {
          providers: [
            { provide: ProjectsListInfoService, useValue: projectsListInfoServiceSpy },
            { provide: ProjectsInfoService, useValue: projectsInfoServiceSpy },
            { provide: ProgramDetailListInfoService, useValue: programDetailListInfoServiceSpy },
            {
              provide: ProgramDetailListUIInfoService,
              useValue: programDetailListUIInfoServiceSpy,
            },
            { provide: OfficeInfoService, useValue: officeInfoServiceSpy },
            { provide: OfficeUIInfoService, useValue: officeUIInfoServiceSpy },
            { provide: SwipeService, useValue: swipeServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
