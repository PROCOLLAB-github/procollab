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
      description: "",
      requiredSkills: [{ id: 1, name: skillName, category: { name: "Hard skills" } }],
    });
    fixture.detectChanges();

    const skill = fixture.nativeElement.querySelector(
      "app-tag.skills__tag--readable",
    ) as HTMLElement;
    expect(skill.textContent?.trim()).toBe(skillName);
  });
});
