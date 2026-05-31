/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { OfficeComponent } from "./office.component";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { OfficeUIInfoService } from "@api/office/facades/ui/office-ui-info.service";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";
import { AuthRegisterService } from "@api/auth/facades/auth-register.service";
import { ChatUnreadStateService } from "@api/chat/chat-unread-state.service";
import { ProgramShellInfoService } from "@api/program/facades/program-shell-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

describe("OfficeComponent", () => {
  let component: OfficeComponent;
  let fixture: ComponentFixture<OfficeComponent>;

  beforeEach(async () => {
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    const officeInfoServiceSpy = jasmine.createSpyObj("OfficeInfoService", [
      "initializationOffice",
      "destroy",
      "onRejectInvite",
      "onAcceptInvite",
      "onLogout",
    ], {
      invites: signal([]),
    });

    const officeUIInfoServiceSpy = {
      waitVerificationModal: signal(false),
      waitVerificationAccepted: signal(false),
      inviteErrorModal: signal(false),
      navItems: signal([]),
      applyAcceptWaitVerification: jasmine.createSpy("applyAcceptWaitVerification"),
    };

    const authUIInfoServiceSpy = {};

    const authRegisterServiceSpy = {
      downloadPolicy: jasmine.createSpy("downloadPolicy"),
    };

    const chatUnreadStateSpy = {
      hasUnreads: signal(false),
      ensureLoaded: jasmine.createSpy("ensureLoaded"),
      markRead: jasmine.createSpy("markRead"),
    };

    const programShellInfoServiceSpy = {
      actualPrograms: signal([]),
      ensureProgramsLoaded: jasmine.createSpy("ensureProgramsLoaded").and.returnValue(of({ ok: true, value: { results: [], count: 0 } })),
      invalidatePrograms: jasmine.createSpy("invalidatePrograms"),
    };

    const profileInfoServiceSpy = {
      profile: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OfficeComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        provideRouter([]),
      ],
    })
      .overrideComponent(OfficeComponent, {
        remove: {
          providers: [OfficeInfoService, OfficeUIInfoService, AuthUIInfoService, AuthRegisterService],
        },
        add: {
          providers: [
            { provide: OfficeInfoService, useValue: officeInfoServiceSpy },
            { provide: OfficeUIInfoService, useValue: officeUIInfoServiceSpy },
            { provide: AuthUIInfoService, useValue: authUIInfoServiceSpy },
            { provide: AuthRegisterService, useValue: authRegisterServiceSpy },
            { provide: ChatUnreadStateService, useValue: chatUnreadStateSpy },
            { provide: ProgramShellInfoService, useValue: programShellInfoServiceSpy },
            { provide: ProfileInfoService, useValue: profileInfoServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
