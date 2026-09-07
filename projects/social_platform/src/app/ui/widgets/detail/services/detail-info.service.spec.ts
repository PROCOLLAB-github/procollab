/** @format */

import { Location } from "@angular/common";
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, of } from "rxjs";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectFormService } from "@api/project/project-form.service";
import { User } from "@domain/auth/user.model";
import { DetailInfoService } from "./detail-info.service";
import { DetailProfileInfoService } from "./profile/detail-profile-info.service";
import { DetailProgramInfoService } from "./program/detail-program-info.service";
import { DetailProjectInfoService } from "./project/detail-project-info.service";

describe("DetailInfoService application identity", () => {
  it("loads the existing application after the asynchronously loaded profile and once per program", () => {
    const profile = signal<User | null>(null);
    const program = signal({ id: 12, isUserMember: true, isUserManager: false });
    const data = new BehaviorSubject({ listType: "program" });
    const loadApplication = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        DetailInfoService,
        { provide: ActivatedRoute, useValue: { data, queryParams: of({}) } },
        { provide: Router, useValue: { url: "/office/program/12" } },
        { provide: Location, useValue: { onUrlChange: vi.fn(() => vi.fn()) } },
        { provide: ProjectFormService, useValue: { getForm: () => new FormGroup({}) } },
        { provide: ProgramDetailMainUIInfoService, useValue: { program } },
        { provide: ProjectsDetailUIInfoService, useValue: {} },
        { provide: ProfileDetailUIInfoService, useValue: { isProfileFill: signal(false) } },
        { provide: DetailProfileInfoService, useValue: { profile, memberProjects: signal([]) } },
        { provide: DetailProjectInfoService, useValue: { applyUpdateStage: vi.fn() } },
        {
          provide: DetailProgramInfoService,
          useValue: { loadApplication, application: signal(null), applyUpdateStage: vi.fn() },
        },
      ],
    });
    const service = TestBed.inject(DetailInfoService);
    service.initializationDetail();
    TestBed.tick();
    expect(loadApplication).not.toHaveBeenCalled();

    profile.set({ id: 7, personal: { userType: 1 } } as User);
    TestBed.tick();
    expect(loadApplication).toHaveBeenCalledExactlyOnceWith(12, 7);
    profile.set({ ...profile()!, city: "Москва" });
    TestBed.tick();
    expect(loadApplication).toHaveBeenCalledTimes(1);

    program.set({ id: 13, isUserMember: true, isUserManager: false });
    data.next({ listType: "program" });
    TestBed.tick();
    expect(loadApplication).toHaveBeenCalledTimes(2);
    expect(loadApplication).toHaveBeenLastCalledWith(13, 7);

    program.set({ id: 14, isUserMember: true, isUserManager: true });
    data.next({ listType: "program" });
    TestBed.tick();
    expect(loadApplication).toHaveBeenCalledTimes(2);
  });
});
