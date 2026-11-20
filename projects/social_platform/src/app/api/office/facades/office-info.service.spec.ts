/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { NavigationEnd, Router } from "@angular/router";
import { of, Subject, throwError } from "rxjs";
import { ChatUnreadStateService } from "@api/chat/chat-unread-state.service";
import { ConnectChatUseCase } from "@api/chat/use-cases/connect-chat.use-case";
import { ObserveSetOfflineUseCase } from "@api/chat/use-cases/observe-set-offline.use-case";
import { ObserveSetOnlineUseCase } from "@api/chat/use-cases/observe-set-online.use-case";
import { IndustryStateInfoService } from "@api/industry/facades/industry-state-info.service";
import { InviteInfoService } from "@api/invite/facades/invite-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProgramShellInfoService } from "@api/program/facades/program-shell-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { User, UserRelations } from "@domain/auth/user.model";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { EventBus } from "@domain/shared/event-bus";
import { OfficeInfoService } from "./office-info.service";
import { OfficeUIInfoService } from "./ui/office-ui-info.service";

describe("OfficeInfoService verification notice", () => {
  const confirmedAt = "2026-11-21T09:00:00Z";
  const profile = signal<User | null>(null);
  let events: Subject<NavigationEnd>;
  let acknowledge: ReturnType<typeof vi.fn>;
  let service: OfficeInfoService;

  function user(relations: Partial<UserRelations> = {}, onboardingStage: number | null = null) {
    return Object.assign(new User(), {
      personal: { onboardingStage },
      relations: {
        isActive: true,
        verificationDate: null,
        verificationNoticeAcknowledgedAt: null,
        ...relations,
      },
    });
  }

  function navigate(url: string, urlAfterRedirects = url): void {
    events.next(new NavigationEnd(1, url, urlAfterRedirects));
  }

  beforeEach(() => {
    events = new Subject();
    acknowledge = vi.fn();
    profile.set(user());
    TestBed.configureTestingModule({
      providers: [
        OfficeInfoService,
        OfficeUIInfoService,
        { provide: Router, useValue: { events, url: "/office/program/17" } },
        { provide: AuthRepositoryPort, useValue: { acknowledgeVerificationNotice: acknowledge } },
        { provide: InviteInfoService, useValue: { invites: signal([]) } },
        {
          provide: ProfileInfoService,
          useValue: { profile, applyProfileUpdated: (updated: User) => profile.set(updated) },
        },
        ...[
          LoggerService,
          EventBus,
          IndustryStateInfoService,
          ProgramShellInfoService,
          ChatUnreadStateService,
          ConnectChatUseCase,
          ObserveSetOfflineUseCase,
          ObserveSetOnlineUseCase,
          ChatStateService,
        ].map(provide => ({ provide, useValue: {} })),
      ],
    });
    service = TestBed.inject(OfficeInfoService);
  });

  it("keeps the account notice out of program pages and preserves it for the general office", () => {
    expect(service.waitVerificationModal()).toBe(false);
    navigate("/office/program/17/register", "/office/program/17");
    expect(service.waitVerificationModal()).toBe(false);
    navigate("/office/program/17/solutions/new");
    expect(service.waitVerificationModal()).toBe(false);
    service.onAcknowledgeVerificationNotice();
    expect(acknowledge).not.toHaveBeenCalled();

    navigate("/office/feed");
    expect(service.waitVerificationModal()).toBe(true);
    navigate("/office/program/18?source=catalog");
    expect(service.waitVerificationModal()).toBe(false);
    navigate("/office/program/all");
    expect(service.waitVerificationModal()).toBe(true);
  });

  it("omits the notice for inactive, verified, acknowledged, onboarding and evaluation profiles", () => {
    navigate("/office/feed");
    profile.set(user({ isActive: false }));
    expect(service.waitVerificationModal()).toBe(false);
    profile.set(user({ verificationDate: confirmedAt }));
    expect(service.waitVerificationModal()).toBe(false);
    profile.set(user({ verificationNoticeAcknowledgedAt: confirmedAt }));
    expect(service.waitVerificationModal()).toBe(false);
    profile.set(user({}, 0));
    expect(service.waitVerificationModal()).toBe(false);
    profile.set(user({ hasEvaluationAccess: true }));
    navigate("/office/evaluation/17/projects/42");
    expect(service.waitVerificationModal()).toBe(false);
  });

  it("keeps the notice open on failure and closes it on successful retry", () => {
    navigate("/office/feed");
    acknowledge
      .mockReturnValueOnce(throwError(() => new Error("POST failed")))
      .mockReturnValueOnce(of(user({ verificationNoticeAcknowledgedAt: confirmedAt })));

    service.onAcknowledgeVerificationNotice();
    expect(service.waitVerificationModal()).toBe(true);
    expect(service.verificationNoticeError()).toBe(true);

    service.onAcknowledgeVerificationNotice();
    expect(service.waitVerificationModal()).toBe(false);
    expect(service.verificationNoticeError()).toBe(false);
    expect(acknowledge).toHaveBeenCalledTimes(2);
  });
});
