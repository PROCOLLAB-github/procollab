/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { ProfileMainComponent } from "./main.component";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProfileDetailInfoService } from "@api/profile/facades/detail/profile-detail-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { API_URL } from "@corelib";

describe("MainComponent", () => {
  let component: ProfileMainComponent;
  let fixture: ComponentFixture<ProfileMainComponent>;

  beforeEach(async () => {
    const profileDetailInfoServiceSpy = {
      initializationProfile: vi.fn(),
      initCheckDescription: vi.fn(),
      destroy: vi.fn(),
    };

    const profileDetailUIInfoServiceSpy = {
      user: signal({
        id: 1,
        firstName: "Test",
        personal: { birthday: "2000-01-01", links: [] },
        relations: {
          progress: 100,
          skills: [],
          achievements: [],
          userLanguages: [],
          programs: [],
          education: [],
          workExperience: [],
          projects: [],
        },
      } as any),
      loggedUserId: signal(1),
      profileId: signal(1),
      isProfileEmpty: signal(false),
      isProfileFill: signal(false),
      directions: signal([]),
      isShowModal: signal(false),
    };

    const expandServiceSpy = {
      descriptionExpandable: signal(false),
      readFullDescription: signal(""),
      readAll: signal(""),
      onExpand: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ProfileMainComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthRepositoryPort,
          useValue: {
            fetchProfile: of({}),
            fetchUserRoles: of([]),
            fetchChangeableRoles: of([]),
            fetchLeaderProjects: of({}),
          },
        },
        { provide: ExpandService, useValue: expandServiceSpy },
        { provide: ProfileInfoService, useValue: { profile: signal(null) } },
        { provide: API_URL, useValue: "" },
      ],
    })
      .overrideComponent(ProfileMainComponent, {
        remove: {
          providers: [ProfileDetailInfoService, ProfileDetailUIInfoService, ExpandService],
        },
        add: {
          providers: [
            { provide: ProfileDetailInfoService, useValue: profileDetailInfoServiceSpy },
            { provide: ProfileDetailUIInfoService, useValue: profileDetailUIInfoServiceSpy },
            { provide: ExpandService, useValue: expandServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
