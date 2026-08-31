/** @format */

import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { FileService, ValidationService } from "@corelib";
import { NewsInfoService } from "@api/news/news-info.service";
import { ProfileDetailInfoService } from "@api/profile/facades/detail/profile-detail-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { User } from "@domain/auth/user.model";
import { ProfileMidSideComponent } from "./profile-mid-side.component";

describe("ProfileMidSideComponent", () => {
  let fixture: ComponentFixture<ProfileMidSideComponent>;
  let ui: ProfileDetailUIInfoService;

  const createUser = (id: number, filled: boolean, aboutMe = ""): User =>
    ({
      id,
      firstName: filled ? "Анна" : "",
      lastName: filled ? "Иванова" : "",
      email: filled ? "anna@example.test" : "",
      personal: {
        aboutMe,
        avatar: filled ? "https://example.test/avatar.png" : "",
        birthday: filled ? "2000-01-01" : null,
      },
      relations: {
        progress: filled ? 100 : 0,
        profileFillPromptAcknowledgedAt: null,
        skills: [],
        achievements: [],
      },
    }) as unknown as User;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileMidSideComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProfileDetailInfoService,
          useValue: {
            onAddNews: vi.fn(),
            onDeleteNews: vi.fn(),
            onLike: vi.fn(),
            onEditNews: vi.fn(),
            onNewsInView: vi.fn(),
          },
        },
        { provide: NewsInfoService, useValue: { news: signal([]) } },
        ProfileDetailUIInfoService,
        { provide: ValidationService, useValue: { getFormValidation: vi.fn() } },
        { provide: FileService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMidSideComponent);
    ui = TestBed.inject(ProfileDetailUIInfoService);
    const user = createUser(7, false);
    ui.applySetLoggedUserId("logged", 7);
    ui.applyInitProfile({ data: { user } }, 7);
    fixture.componentRef.setInput("user", user);
    fixture.detectChanges();
  });

  it("показывает центрируемый empty state владельцу пустого профиля", () => {
    const emptyState = fixture.nativeElement.querySelector(
      '[data-testid="empty-profile-state"]',
    ) as HTMLElement;

    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain("заполните профиль и начните пользоваться PROCOLLAB");
  });

  it("does not leak empty state across foreign and own profile navigation", () => {
    const foreignEmpty = createUser(20, false);
    const ownFilled = createUser(10, true, "Заполненный профиль");
    ui.applySetLoggedUserId("logged", 10);

    ui.applyInitProfile({ data: { user: foreignEmpty } }, 10);
    fixture.componentRef.setInput("user", foreignEmpty);
    fixture.detectChanges();
    expect(ui.isProfileEmpty()).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-testid="empty-profile-state"]')).toBeFalsy();

    ui.applyInitProfile({ data: { user: ownFilled } }, 10);
    fixture.componentRef.setInput("user", ownFilled);
    fixture.detectChanges();
    expect(ui.isProfileEmpty()).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-testid="empty-profile-state"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector("app-news-form")).toBeTruthy();

    ui.applyInitProfile({ data: { user: foreignEmpty } }, 10);
    fixture.componentRef.setInput("user", foreignEmpty);
    fixture.detectChanges();
    ui.applyInitProfile({ data: { user: ownFilled } }, 10);
    fixture.componentRef.setInput("user", ownFilled);
    fixture.detectChanges();

    expect(ui.isProfileEmpty()).toBe(false);
    expect(fixture.nativeElement.querySelector("app-news-form")).toBeTruthy();
  });

  it("shows the full 300-character about me text without expansion control", () => {
    const aboutMe = "Я".repeat(300);
    const user = createUser(7, true, aboutMe);
    ui.applyInitProfile({ data: { user } }, 7);
    fixture.componentRef.setInput("user", user);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".about__text p").textContent).toBe(aboutMe);
    expect(fixture.nativeElement.querySelector(".about .read-more")).toBeFalsy();
  });
});
