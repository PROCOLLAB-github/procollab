/** @format */

import { ProfileDetailUIInfoService } from "./profile-detail-ui-info.service";
import { User } from "@domain/auth/user.model";

function createUser(id: number, acknowledgedAt: string | null = null): User {
  return {
    id,
    firstName: "Иван",
    lastName: "Иванов",
    email: "ivan@example.test",
    personal: {
      aboutMe: "",
      avatar: "",
      birthday: "",
      links: [],
    },
    relations: {
      progress: 40,
      skills: [],
      achievements: [],
      profileFillPromptAcknowledgedAt: acknowledgedAt,
    },
  } as User;
}

describe("ProfileDetailUIInfoService", () => {
  it("does not classify a profile before it has loaded", () => {
    expect(new ProfileDetailUIInfoService().isProfileEmpty()).toBeUndefined();
  });

  it("keeps the empty state for an account with only registration data", () => {
    const service = new ProfileDetailUIInfoService();
    service.applyInitProfile({ data: { user: createUser(7) } }, 7);
    expect(service.isProfileEmpty()).toBe(true);
  });

  it.each([
    "projects",
    "programs",
    "skills",
    "achievements",
    "education",
    "workExperience",
    "userLanguages",
  ])("does not show an empty profile when %s exist without an avatar", field => {
    const service = new ProfileDetailUIInfoService();
    const user = createUser(7);
    Object.assign(user.relations, { [field]: [{ id: 1 }] });
    service.applyInitProfile({ data: { user } }, 7);
    expect(service.isProfileEmpty()).toBe(false);
  });

  it.each(["aboutMe", "avatar", "birthday", "city", "region", "speciality"])(
    "does not show an empty profile when %s is filled",
    field => {
      const service = new ProfileDetailUIInfoService();
      const user = createUser(7);
      Object.assign(user.personal, { [field]: "filled" });
      service.applyInitProfile({ data: { user } }, 7);
      expect(service.isProfileEmpty()).toBe(false);
    },
  );

  it("recomputes emptiness when navigating from an active account to a new one", () => {
    const service = new ProfileDetailUIInfoService();
    const active = createUser(7);
    Object.assign(active.relations, { projects: [{ id: 1 }] });
    service.applyInitProfile({ data: { user: active } }, 7);
    expect(service.isProfileEmpty()).toBe(false);
    service.applyInitProfile({ data: { user: createUser(8) } }, 7);
    expect(service.isProfileEmpty()).toBe(true);
  });

  it("показывает предложение заполнить только собственный неполный профиль", () => {
    const service = new ProfileDetailUIInfoService();

    service.applyInitProfile({ data: { user: createUser(7) } }, 7);

    expect(service.isProfileFill()).toBe(true);
  });

  it("не показывает предложение в чужом профиле", () => {
    const service = new ProfileDetailUIInfoService();

    service.applyInitProfile({ data: { user: createUser(7) } }, 8);

    expect(service.isProfileFill()).toBe(false);
  });

  it("не показывает уже подтверждённое предложение на другом устройстве", () => {
    const service = new ProfileDetailUIInfoService();

    service.applyInitProfile({ data: { user: createUser(7, "2026-08-24T10:00:00Z") } }, 7);

    expect(service.isProfileFill()).toBe(false);
  });

  it("закрывает предложение только после подтверждения", () => {
    const service = new ProfileDetailUIInfoService();
    service.applyInitProfile({ data: { user: createUser(7) } }, 7);

    service.applyProfileFillAcknowledged("2026-08-24T10:00:00Z");

    expect(service.isProfileFill()).toBe(false);
    expect(service.user()?.relations.profileFillPromptAcknowledgedAt).toBe("2026-08-24T10:00:00Z");
  });
});
