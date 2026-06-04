/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MembersComponent } from "./members.component";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { MembersInfoService } from "@api/member/facades/members-info.service";
import { MembersUIInfoService } from "@api/member/facades/ui/members-ui-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { of } from "rxjs";
import { signal } from "@angular/core";
import { initial } from "@domain/shared/async-state";
import { FormBuilder } from "@angular/forms";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";

describe("MembersComponent", () => {
  let component: MembersComponent;
  let fixture: ComponentFixture<MembersComponent>;

  beforeEach(async () => {
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const membersInfoServiceSpy = {
      initializationMembers: vi.fn(),
      initScroll: vi.fn(),
      destroy: vi.fn(),
      redirectToProfile: vi.fn(),
    };

    const fb = new FormBuilder();
    const membersUIInfoServiceSpy = {
      members: signal([]),
      members$: signal(initial()),
      searchForm: fb.group({ search: [""] }),
      filterForm: fb.group({ keySkill: [""], speciality: [""] }),
    };

    const profileDetailUIInfoServiceSpy = {
      user: undefined,
      loggedUserId: 0,
      profileId: 0,
    };

    await TestBed.configureTestingModule({
      imports: [MembersComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        {
          provide: SkillsRepositoryPort,
          useValue: {
            getSkillsNested: () => of([]),
            getSkillsInline: () => of({ results: [], count: 0, next: "", previous: "" }),
          },
        },
        {
          provide: SpecializationsRepositoryPort,
          useValue: {
            getSpecializationsInline: () => of({ results: [], count: 0, next: "", previous: "" }),
          },
        },
        provideRouter([]),
      ],
    })
      .overrideComponent(MembersComponent, {
        remove: {
          providers: [MembersInfoService, MembersUIInfoService, ProfileDetailUIInfoService],
        },
        add: {
          providers: [
            { provide: MembersInfoService, useValue: membersInfoServiceSpy },
            { provide: MembersUIInfoService, useValue: membersUIInfoServiceSpy },
            { provide: ProfileDetailUIInfoService, useValue: profileDetailUIInfoServiceSpy },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
