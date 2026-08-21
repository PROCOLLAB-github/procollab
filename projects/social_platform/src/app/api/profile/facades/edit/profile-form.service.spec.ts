/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProfileInfoService } from "../profile-info.service";
import { ProfileFormService } from "./profile-form.service";

describe("ProfileFormService", () => {
  let service: ProfileFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileFormService,
        {
          provide: AuthRepositoryPort,
          useValue: {
            updateAvatar: vi.fn(),
            updateProfile: vi.fn(),
          },
        },
        {
          provide: ProfileInfoService,
          useValue: {
            changeableRoles: signal([]),
            profile: signal(null),
          },
        },
      ],
    });

    service = TestBed.inject(ProfileFormService);
  });

  it("should create empty string control when adding a new link", () => {
    service.addLink();

    expect(service.links.length).toBe(1);
    expect(service.links.at(0).value).toBe("");
    expect(typeof service.links.at(0).value).toBe("string");
  });

  it("should trim links and drop empty values for save payload", () => {
    service.addLink(" https://t.me/procollab ");
    service.addLink("   ");

    expect(service.getCleanLinks()).toEqual(["https://t.me/procollab"]);
  });

  it("should allow backend-supported formatted phone and reject invalid phone", () => {
    service.phoneNumber.setValue("+7 (999) 123-45-67");

    expect(service.phoneNumber.valid).toBe(true);

    service.phoneNumber.setValue("wrong-phone");

    expect(service.phoneNumber.hasError("pattern")).toBe(true);
  });
});
