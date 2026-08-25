/** @format */

import { ProfileDetailUIInfoService } from "./profile-detail-ui-info.service";
import { User } from "@domain/auth/user.model";

function createUser(id: number, acknowledgedAt: string | null = null): User {
  return {
    id,
    relations: {
      progress: 40,
      skills: [],
      achievements: [],
      profileFillPromptAcknowledgedAt: acknowledgedAt,
    },
  } as User;
}

describe("ProfileDetailUIInfoService", () => {
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
