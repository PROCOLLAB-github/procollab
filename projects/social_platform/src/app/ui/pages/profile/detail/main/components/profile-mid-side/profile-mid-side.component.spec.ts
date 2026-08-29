/** @format */

import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ExpandService } from "@api/expand/expand.service";
import { NewsInfoService } from "@api/news/news-info.service";
import { ProfileDetailInfoService } from "@api/profile/facades/detail/profile-detail-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { User } from "@domain/auth/user.model";
import { ProfileMidSideComponent } from "./profile-mid-side.component";

describe("ProfileMidSideComponent", () => {
  let fixture: ComponentFixture<ProfileMidSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileMidSideComponent],
      providers: [
        provideRouter([]),
        { provide: ProfileDetailInfoService, useValue: {} },
        { provide: NewsInfoService, useValue: { news: signal([]) } },
        {
          provide: ProfileDetailUIInfoService,
          useValue: {
            loggedUserId: signal(7),
            isProfileEmpty: signal(true),
            directions: signal([]),
          },
        },
        {
          provide: ExpandService,
          useValue: {
            descriptionExpandable: signal(false),
            readFullDescription: signal(false),
            onExpand: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMidSideComponent);
    fixture.componentRef.setInput("user", {
      id: 7,
      personal: { aboutMe: "" },
      relations: { skills: [], achievements: [] },
    } as User);
    fixture.detectChanges();
  });

  it("показывает центрируемый empty state владельцу пустого профиля", () => {
    const emptyState = fixture.nativeElement.querySelector(
      '[data-testid="empty-profile-state"]',
    ) as HTMLElement;

    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain("заполните профиль и начните пользоваться PROCOLLAB");
  });
});
