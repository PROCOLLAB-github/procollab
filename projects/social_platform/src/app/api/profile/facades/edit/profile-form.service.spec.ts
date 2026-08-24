/** @format */

import { signal, WritableSignal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User } from "@domain/auth/user.model";
import { NEVER, of } from "rxjs";
import { ProfileInfoService } from "../profile-info.service";
import { ProfileFormService } from "./profile-form.service";

describe("ProfileFormService", () => {
  let service: ProfileFormService;
  let profile: WritableSignal<User | null>;
  let authRepository: {
    updateAvatar: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
  };
  let profileInfoService: {
    changeableRoles: ReturnType<typeof signal>;
    profile: WritableSignal<User | null>;
    applyProfileUpdated: ReturnType<typeof vi.fn>;
  };

  const createProfile = (): User =>
    ({
      id: 42,
      email: "profile@example.test",
      firstName: "Иван",
      lastName: "Иванов",
      personal: {
        userType: 1,
        birthday: "1990-03-25",
        city: "Москва",
        phoneNumber: "+79991234567",
        coverImageAddress: "",
        v2Speciality: { id: 1, name: "Разработчик" },
        speciality: "Frontend developer",
        avatar: "avatar.jpg",
        aboutMe: "О себе",
        isMospolytechStudent: false,
        studyGroup: "",
        links: [],
      },
      relations: {
        skills: [],
        workExperience: [],
        education: [],
        userLanguages: [],
        achievements: [],
      },
      roles: {
        member: { usefulToProject: "" },
      },
    }) as User;

  beforeEach(() => {
    profile = signal<User | null>(createProfile());
    authRepository = {
      updateAvatar: vi.fn().mockReturnValue(of(createProfile())),
      updateProfile: vi.fn().mockReturnValue(NEVER),
    };
    profileInfoService = {
      changeableRoles: signal([]),
      profile,
      applyProfileUpdated: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ProfileFormService,
        {
          provide: AuthRepositoryPort,
          useValue: authRepository,
        },
        {
          provide: ProfileInfoService,
          useValue: profileInfoService,
        },
      ],
    });

    service = TestBed.inject(ProfileFormService);
  });

  const initializeProfileData = async (): Promise<void> => {
    service.initializeProfileData();
    await vi.waitFor(() => expect(service.profileId()).toBe(42));
  };

  it("should not update profile while initializing profile data", async () => {
    await initializeProfileData();

    expect(authRepository.updateProfile).not.toHaveBeenCalled();
  });

  it("should not update profile during repeated initialization", async () => {
    await initializeProfileData();
    service.profileId.set(undefined);
    service.initializeProfileData();
    await vi.waitFor(() => expect(service.profileId()).toBe(42));

    expect(authRepository.updateProfile).not.toHaveBeenCalled();
  });

  it("should not update avatar while initializing profile data", async () => {
    await initializeProfileData();

    expect(authRepository.updateAvatar).not.toHaveBeenCalled();
  });

  it("should update profile once on the first real user type change", async () => {
    await initializeProfileData();

    service.userType.setValue(2);

    expect(authRepository.updateProfile).toHaveBeenCalledTimes(1);
    expect(authRepository.updateProfile).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ userType: 2 }),
    );
  });

  it("should update avatar once on the first real avatar change", async () => {
    await initializeProfileData();

    service.avatar.setValue("new-avatar.jpg");

    expect(authRepository.updateAvatar).toHaveBeenCalledTimes(1);
    expect(authRepository.updateAvatar).toHaveBeenCalledWith("new-avatar.jpg", 42);
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
