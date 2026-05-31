/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectInfoComponent } from "./info.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ProjectNewsRepository as ProjectNewsService } from "@infrastructure/repository/project/project-news.repository";
import { ReactiveFormsModule } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { signal } from "@angular/core";
import { ProjectsDetailService } from "@api/project/facades/detail/projects-detail.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";

describe("ProjectInfoComponent", () => {
  let component: ProjectInfoComponent;
  let fixture: ComponentFixture<ProjectInfoComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };
    const projectNewsServiceSpy = jasmine.createSpyObj({ fetchNews: of({}) });
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const projectsDetailServiceSpy = jasmine.createSpyObj("ProjectsDetailService", [
      "initializationProjectInfo",
      "initCheckDescription",
      "destroy",
    ]);

    const projectsDetailUIInfoServiceSpy = {
      project: signal(undefined),
    };

    const profileDetailUIInfoServiceSpy = {
      user: signal(undefined),
      loggedUserId: signal(0),
      profileId: signal(0),
      applySetLoggedUserId: jasmine.createSpy("applySetLoggedUserId"),
    };

    const expandServiceSpy = jasmine.createSpyObj("ExpandService", [], {
      expanded: signal({}),
    });

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        ProjectInfoComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
      ],
    })
      .overrideComponent(ProjectInfoComponent, {
        remove: {
          providers: [ProjectsDetailService, ProfileDetailUIInfoService, ExpandService],
        },
        add: {
          providers: [
            { provide: ProjectsDetailService, useValue: projectsDetailServiceSpy },
            { provide: ProfileDetailUIInfoService, useValue: profileDetailUIInfoServiceSpy },
            { provide: ExpandService, useValue: expandServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
