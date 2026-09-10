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

  it("keeps complete education and work labels in the profile DOM", () => {
    const educationName = "Санкт-Петербургский политехнический университет Петра Великого";
    const workName = "Научно-исследовательский центр цифровых образовательных технологий";
    const jobPosition = "Ведущий специалист по развитию образовательных продуктов";

    fixture.componentRef.setInput("user", {
      personal: { links: [] },
      relations: {
        education: [
          {
            organizationName: educationName,
            description: "Прикладная информатика",
            educationLevel: "Высшее образование",
            educationStatus: "Завершено",
            entryYear: 2018,
            completionYear: 2022,
          },
        ],
        workExperience: [
          {
            organizationName: workName,
            jobPosition,
            description: "Развитие продуктов",
            entryYear: 2022,
            completionYear: 2026,
          },
        ],
        projects: [],
      },
    } as unknown as User);
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(".lists__info--text, .lists__info--subtext"),
      (element: Element) => element.textContent?.trim(),
    );

    expect(labels).toContain(educationName);
    expect(labels).toContain(workName);
    expect(labels).toContain(jobPosition);
  });
});
