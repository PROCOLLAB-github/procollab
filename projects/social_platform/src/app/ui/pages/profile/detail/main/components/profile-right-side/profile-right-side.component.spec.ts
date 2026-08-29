/** @format */

import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ExpandService } from "@api/expand/expand.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { User } from "@domain/auth/user.model";
import { ProfileRightSideComponent } from "./profile-right-side.component";

describe("ProfileRightSideComponent", () => {
  let fixture: ComponentFixture<ProfileRightSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileRightSideComponent],
      providers: [
        provideRouter([]),
        {
          provide: ExpandService,
          useValue: { readAll: signal({}), toggleReadAll: vi.fn() },
        },
        {
          provide: ProfileDetailUIInfoService,
          useValue: { isShowModal: signal(false), applyOpenWorkInfoModal: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileRightSideComponent);
  });

  it("keeps the complete long project title in the profile project list DOM", () => {
    const projectName = "Очень длинное название проекта без жесткого символьного обрезания";
    fixture.componentRef.setInput("user", {
      personal: { links: [] },
      relations: {
        education: [],
        workExperience: [],
        projects: [
          { id: 1, name: projectName, imageAddress: "", collaborator: { role: "Участник" } },
        ],
      },
    } as unknown as User);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".lists__project-name").textContent.trim()).toBe(
      projectName,
    );
  });
});
