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
import { NotificationService } from "@ui/services/notification/notification.service";

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

    const officeInfoServiceSpy = {
      initializationOffice: vi.fn(),
      destroy: vi.fn(),
      onAcknowledgeVerificationNotice: vi.fn(),
      onRejectInvite: vi.fn(),
      onAcceptInvite: vi.fn(),
      onLogout: vi.fn(),
      invites: signal([]),
    };

    const officeUIInfoServiceSpy = {
      waitVerificationModal: signal(false),
      verificationAcknowledgementPending: signal(false),
      inviteErrorModal: signal(false),
      navItems: signal([]),
    };

    const authUIInfoServiceSpy = {};

    const authRegisterServiceSpy = {
      downloadPolicy: vi.fn(),
    };

    const chatUnreadStateSpy = {
      hasUnreads: signal(false),
      ensureLoaded: vi.fn(),
      markRead: vi.fn(),
    };

    const programShellInfoServiceSpy = {
      actualPrograms: signal([]),
      ensureProgramsLoaded: vi
        .fn()
        .mockReturnValue(of({ ok: true, value: { results: [], count: 0 } })),
      invalidatePrograms: vi.fn(),
    };

    const profileInfoServiceSpy = {
      profile: signal(null),
    };

    const notificationServiceSpy = {
      notifications: signal([]),
      unreadCount: signal(0),
      loading: signal(false),
      loadingMore: signal(false),
      markingAllRead: signal(false),
      hasMore: signal(false),
      error: signal(null),
      initialize: vi.fn(),
      onPopupOpenChange: vi.fn(),
      openNotification: vi.fn(),
      markAllRead: vi.fn(),
      loadMore: vi.fn(),
      retry: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OfficeComponent],
      providers: [{ provide: AuthRepositoryPort, useValue: authPortSpy }, provideRouter([])],
    })
      .overrideComponent(OfficeComponent, {
        remove: {
          providers: [
            OfficeInfoService,
            OfficeUIInfoService,
            AuthUIInfoService,
            AuthRegisterService,
            NotificationService,
          ],
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
            { provide: NotificationService, useValue: notificationServiceSpy },
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

  it("инициализирует notification lifecycle один раз вместе с Office", () => {
    const notificationService = fixture.debugElement.injector.get(NotificationService);

    expect(notificationService.initialize).toHaveBeenCalledOnce();
  });

  it("подтверждает уведомление о верификации через backend", () => {
    const officeInfoService = fixture.debugElement.injector.get(OfficeInfoService);

    component.onAcceptWaitVerification();

    expect(officeInfoService.onAcknowledgeVerificationNotice).toHaveBeenCalledOnce();
  });

  it("не содержит дублирующее приветствие программы", () => {
    expect(fixture.nativeElement.textContent).not.toContain("Привет! Рады знакомству");
  });
});
