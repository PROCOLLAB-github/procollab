/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { NEVER, of } from "rxjs";
import { OfficeInfoService } from "./office-info.service";
import { OfficeUIInfoService } from "./ui/office-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ChatUnreadStateService } from "@api/chat/chat-unread-state.service";
import { InviteInfoService } from "@api/invite/facades/invite-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { IndustryStateInfoService } from "@api/industry/facades/industry-state-info.service";
import { ConnectChatUseCase } from "@api/chat/use-cases/connect-chat.use-case";
import { ObserveSetOfflineUseCase } from "@api/chat/use-cases/observe-set-offline.use-case";
import { ObserveSetOnlineUseCase } from "@api/chat/use-cases/observe-set-online.use-case";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { EventBus } from "@domain/shared/event-bus";
import { ProgramShellInfoService } from "@api/program/facades/program-shell-info.service";
import { User } from "@domain/auth/user.model";

describe("OfficeInfoService", () => {
  function setup(onboardingStage: number | null, verificationDate: string | null) {
    const profile = Object.assign(new User(), {
      id: 42,
      personal: { onboardingStage },
      relations: { verificationDate },
    });
    const router = {
      url: "/office",
      navigateByUrl: vi.fn(() => Promise.resolve(true)),
    };
    const officeUI = {
      applyCreateNavItems: vi.fn(),
      applyOpenVerificationModal: vi.fn(),
      applyVerificationModal: vi.fn(),
      applyOpenInviteErrorModal: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        OfficeInfoService,
        { provide: Router, useValue: router },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
        { provide: EventBus, useValue: { emit: vi.fn() } },
        { provide: AuthRepositoryPort, useValue: { logout: vi.fn(() => of(undefined)) } },
        {
          provide: InviteInfoService,
          useValue: {
            invites: signal([]),
            ensureLoaded: vi.fn(),
            invalidate: vi.fn(),
          },
        },
        { provide: IndustryStateInfoService, useValue: { ensureLoaded: vi.fn() } },
        { provide: ProgramShellInfoService, useValue: { invalidatePrograms: vi.fn() } },
        { provide: OfficeUIInfoService, useValue: officeUI },
        {
          provide: ProfileInfoService,
          useValue: {
            profile: signal<User | null>(profile),
            ensureProfileLoaded: vi.fn(),
            invalidateProfile: vi.fn(),
            invalidateLeaderProjects: vi.fn(),
          },
        },
        {
          provide: ChatUnreadStateService,
          useValue: { ensureLoaded: vi.fn(), invalidate: vi.fn() },
        },
        { provide: ConnectChatUseCase, useValue: { execute: vi.fn(() => of(undefined)) } },
        { provide: ObserveSetOfflineUseCase, useValue: { execute: vi.fn(() => NEVER) } },
        { provide: ObserveSetOnlineUseCase, useValue: { execute: vi.fn(() => NEVER) } },
        { provide: ChatStateService, useValue: { setOnlineStatus: vi.fn() } },
      ],
    });

    const service = TestBed.inject(OfficeInfoService);
    service.initializationOffice();
    TestBed.tick();

    return { router, officeUI };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("создает навигацию и не открывает onboarding для onboardingStage = 0", () => {
    const { router, officeUI } = setup(0, "2026-01-01");

    expect(officeUI.applyCreateNavItems).toHaveBeenCalledExactlyOnceWith(42);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it.each([1, 2])("не открывает onboarding для onboardingStage = %s", onboardingStage => {
    const { router } = setup(onboardingStage, "2026-01-01");

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it("сохраняет обычную навигацию для onboardingStage = null", () => {
    const { router, officeUI } = setup(null, "2026-01-01");

    expect(officeUI.applyCreateNavItems).toHaveBeenCalledExactlyOnceWith(42);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it.each([0, 1, 2, null])(
    "открывает verification modal независимо от onboardingStage = %s",
    onboardingStage => {
      const { officeUI } = setup(onboardingStage, null);

      expect(officeUI.applyOpenVerificationModal).toHaveBeenCalledOnce();
    },
  );

  it("не открывает verification modal для подтвержденного профиля", () => {
    const { officeUI } = setup(0, "2026-01-01");

    expect(officeUI.applyOpenVerificationModal).not.toHaveBeenCalled();
  });
});
