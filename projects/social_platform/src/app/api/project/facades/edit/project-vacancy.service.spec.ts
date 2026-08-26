/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { ValidationService } from "@corelib";
import { ok } from "@domain/shared/result.type";
import { Skill } from "@domain/skills/skill.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { DeleteVacancyUseCase } from "@api/vacancy/use-cases/delete-vacancy.use-case";
import { PostVacancyUseCase } from "@api/vacancy/use-cases/post-vacancy.use-case";
import { UpdateVacancyUseCase } from "@api/vacancy/use-cases/update-vacancy.use-case";
import { ToggleFieldsInfoService } from "../../../toggle-fields/toggle-fields-info.service";
import { ProjectFormService } from "./project-form.service";
import { ProjectVacancyService } from "./project-vacancy.service";
import { ProjectVacancyUIService } from "./ui/project-vacancy-ui.service";
import { ProjectsEditUIInfoService } from "./ui/projects-edit-ui-info.service";

describe("ProjectVacancyService", () => {
  let service: ProjectVacancyService;
  let uiService: ProjectVacancyUIService;
  let postVacancy: ReturnType<typeof vi.fn>;

  const skill = {
    id: 7,
    name: "TypeScript",
    category: { id: 1, name: "Frontend" },
    approves: [],
  } satisfies Skill;

  beforeEach(() => {
    postVacancy = vi.fn(() => of(ok(Object.assign(new Vacancy(), { id: 10 }))));

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        ProjectVacancyService,
        ProjectVacancyUIService,
        {
          provide: ProjectFormService,
          useValue: { editIndex: signal<number | null>(null) },
        },
        {
          provide: ValidationService,
          useValue: { getFormValidation: vi.fn(() => true) },
        },
        {
          provide: ProjectsEditUIInfoService,
          useValue: { onEditClicked: signal(false) },
        },
        {
          provide: ToggleFieldsInfoService,
          useValue: { showFields: vi.fn() },
        },
        { provide: PostVacancyUseCase, useValue: { execute: postVacancy } },
        { provide: UpdateVacancyUseCase, useValue: { execute: vi.fn() } },
        { provide: DeleteVacancyUseCase, useValue: { execute: vi.fn() } },
      ],
    });

    uiService = TestBed.inject(ProjectVacancyUIService);
    service = TestBed.inject(ProjectVacancyService);
  });

  function fillRequiredFields(workFormat: string, city: string | null): void {
    uiService.vacancyForm.patchValue({
      role: "Frontend-разработчик",
      skills: [skill],
      requiredExperience: "без опыта",
      workFormat,
      city,
      workSchedule: "полный рабочий день",
      salary: "50000",
    });
  }

  it.each([
    ["работа в офисе", "  Москва  ", "Москва"],
    ["смешанный формат", "  Казань  ", "Казань"],
  ])("отправляет город для формата %s", (workFormat, city, expectedCity) => {
    fillRequiredFields(workFormat, city);

    service.submitVacancy(42);

    expect(postVacancy).toHaveBeenCalledExactlyOnceWith(
      42,
      expect.objectContaining({ workFormat, city: expectedCity }),
    );
  });

  it("отправляет city=null для удаленной работы", () => {
    fillRequiredFields("работа в офисе", "Москва");
    uiService.workFormat?.setValue("удаленная работа");

    service.submitVacancy(42);

    expect(uiService.city?.value).toBeNull();
    expect(postVacancy).toHaveBeenCalledExactlyOnceWith(
      42,
      expect.objectContaining({ workFormat: "удаленная работа", city: null }),
    );
  });
});
