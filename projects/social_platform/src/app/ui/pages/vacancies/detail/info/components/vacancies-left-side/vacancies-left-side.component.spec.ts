/** @format */

import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ExpandService } from "@api/expand/expand.service";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacanciesLeftSideComponent } from "./vacancies-left-side.component";

describe("VacanciesLeftSideComponent", () => {
  let fixture: ComponentFixture<VacanciesLeftSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacanciesLeftSideComponent],
      providers: [
        {
          provide: VacancyDetailInfoService,
          useValue: {
            initCheckDescription: vi.fn(),
            initCheckSkills: vi.fn(),
          },
        },
        {
          provide: ExpandService,
          useValue: {
            descriptionExpandable: signal(false),
            skillsExpandable: signal(false),
            readFullDescription: signal(false),
            readFullSkills: signal(false),
            onExpand: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VacanciesLeftSideComponent);
  });

  it("renders vacancy detail skills with the readable tag treatment", () => {
    const skillName = "Проектирование пользовательских интерфейсов";
    fixture.componentRef.setInput("vacancy", {
      description: "Описание вакансии",
      requiredSkills: [
        { id: 1, name: skillName, category: { name: "Hard skills" } },
        { id: 2, name: "Коммуникация", category: { name: "Soft skills" } },
      ],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".vacancy.vacancy__left")).not.toBeNull();
    const skill = fixture.nativeElement.querySelector(
      "app-tag.skills__tag--readable",
    ) as HTMLElement;
    expect(skill.textContent?.trim()).toBe(skillName);
    expect(fixture.nativeElement.querySelector(".about__text.text-body-14")?.textContent).toContain(
      "Описание вакансии",
    );
    const skills = fixture.nativeElement.querySelectorAll("app-tag");
    expect(skills).toHaveLength(4);
    for (const tag of skills) {
      expect(tag.classList).toContain("skills__tag");
      expect(tag.classList).toContain("skills__tag--readable");
    }
  });
});
