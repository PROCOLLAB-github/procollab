/** @format */

import { Location } from "@angular/common";
import { computed, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectFormService } from "@api/project/project-form.service";
import { User } from "@domain/auth/user.model";
import { Program } from "@domain/program/program.model";
import { DetailInfoService } from "./detail-info.service";
import { DetailProfileInfoService } from "./profile/detail-profile-info.service";
import { DetailProgramInfoService } from "./program/detail-program-info.service";
import { DetailProjectInfoService } from "./project/detail-project-info.service";

describe("DetailInfoService application identity", () => {
  it("uses the program application without waiting for the current profile", () => {
    const profile = signal<User | null>(null);
    const program = signal(
      Object.assign(Program.default(), {
        id: 12,
        isUserMember: true,
        currentApplication: { projectId: 55, programLinkId: 700, submitted: false },
      }),
    );
    const application = computed(() => program().currentApplication);
    TestBed.configureTestingModule({
      providers: [
        DetailInfoService,
        {
          provide: ActivatedRoute,
          useValue: { data: of({ listType: "program" }), queryParams: of({}) },
        },
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
          useValue: { application, applyUpdateStage: vi.fn() },
        },
      ],
    });
    const service = TestBed.inject(DetailInfoService);
    service.initializationDetail();

    expect(service.profile()).toBeNull();
    expect(service.info()?.id).toBe(12);
    expect(service.isProjectAssigned()).toBe(false);

    program.update(current => ({
      ...current,
      currentApplication: { ...current.currentApplication!, submitted: true },
    }));
    expect(service.isProjectAssigned()).toBe(true);
  });
});
