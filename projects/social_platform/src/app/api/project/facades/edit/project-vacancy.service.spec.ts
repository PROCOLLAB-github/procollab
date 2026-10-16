/** @format */

import { signal, WritableSignal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of, Subject, throwError } from "rxjs";
import { ValidationService } from "@corelib";
import { ok, fail } from "@domain/shared/result.type";
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
  let updateVacancy: ReturnType<typeof vi.fn>;
  let editIndex: WritableSignal<number | null>;

  const skill = {
    id: 7,
    name: "TypeScript",
    category: { id: 1, name: "Frontend" },
    approves: [],
  } satisfies Skill;

  beforeEach(() => {
    postVacancy = vi.fn(() => of(ok(Object.assign(new Vacancy(), { id: 10 }))));
    updateVacancy = vi.fn(() => of(ok(Object.assign(new Vacancy(), { id: 10 }))));
    editIndex = signal<number | null>(null);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        ProjectVacancyService,
        ProjectVacancyUIService,
        {
          provide: ProjectFormService,
          useValue: { editIndex },
        },
        ValidationService,
        {
          provide: ProjectsEditUIInfoService,
          useValue: { onEditClicked: signal(false) },
        },
        {
          provide: ToggleFieldsInfoService,
          useValue: { showFields: vi.fn() },
        },
        { provide: PostVacancyUseCase, useValue: { execute: postVacancy } },
        { provide: UpdateVacancyUseCase, useValue: { execute: updateVacancy } },
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

  it("добавляет вакансию и открывает подтверждение только после успешного ответа", () => {
    const request = new Subject<any>();
    postVacancy.mockReturnValue(request);
    fillRequiredFields("удаленная работа", null);
    service.submitVacancy(42);
    service.submitVacancy(42);
    expect(postVacancy).toHaveBeenCalledTimes(1);
    expect(uiService.vacancyIsSubmittingFlag()).toBe(true);
    expect(uiService.createdVacancyId()).toBeNull();
    expect(uiService.vacancies()).toHaveLength(0);
    request.next(ok(Object.assign(new Vacancy(), { id: 77 })));
    expect(uiService.vacancies().map(v => v.id)).toEqual([77]);
    expect(uiService.createdVacancyId()).toBe(77);
    expect(uiService.vacancyIsSubmittingFlag()).toBe(false);
    uiService.createdVacancyId.set(null);
    expect(uiService.vacancies()).toHaveLength(1);
  });

  it.each(["result", "network"])("не показывает успех при ошибке %s и позволяет повтор", kind => {
    postVacancy.mockReturnValue(
      kind === "result" ? of(fail({ code: "error" })) : throwError(() => new Error("network")),
    );
    fillRequiredFields("удаленная работа", null);
    service.submitVacancy(42);
    expect(uiService.createdVacancyId()).toBeNull();
    expect(uiService.vacancies()).toHaveLength(0);
    expect(uiService.vacancyIsSubmittingFlag()).toBe(false);
    expect(uiService.vacancyForm.value.role).toBe("Frontend-разработчик");
    postVacancy.mockReturnValue(of(ok(Object.assign(new Vacancy(), { id: 78 }))));
    service.submitVacancy(42);
    expect(uiService.createdVacancyId()).toBe(78);
  });

  it("сохранение изменений не показывает подтверждение создания", () => {
    fillRequiredFields("удаленная работа", null);
    uiService.applySetVacancies([Object.assign(new Vacancy(), { id: 10 })]);
    editIndex.set(0);
    service.submitVacancy(42);
    expect(updateVacancy).toHaveBeenCalledTimes(1);
    expect(postVacancy).not.toHaveBeenCalled();
    expect(uiService.createdVacancyId()).toBeNull();
  });

  it("сохраняет id навыков и восстанавливает серверный набор при повторном редактировании", () => {
    const librarySkill = { ...skill, id: 8, name: "Angular" };
    fillRequiredFields("удаленная работа", null);
    uiService.skills?.setValue([skill, librarySkill]);
    const created = Object.assign(new Vacancy(), {
      id: 80,
      ...uiService.vacancyForm.getRawValue(),
      requiredSkills: [skill, librarySkill],
    });
    postVacancy.mockReturnValue(of(ok(created)));
    service.submitVacancy(42);
    expect(postVacancy).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ requiredSkillsIds: [7, 8] }),
    );
    expect(uiService.skills?.value).toEqual([]);
    uiService.applyEditVacancy(0);
    expect(uiService.skills?.value?.map(s => s.id)).toEqual([7, 8]);

    uiService.skills?.setValue([librarySkill]);
    updateVacancy.mockReturnValue(of(ok({ ...created, requiredSkills: [librarySkill] })));
    service.submitVacancy(42);
    expect(updateVacancy).toHaveBeenCalledWith(
      80,
      expect.objectContaining({ requiredSkillsIds: [8] }),
    );
    uiService.applyEditVacancy(0);
    expect(uiService.skills?.value).toEqual([librarySkill]);
  });

  it("сохраняет числовую зарплату из DEV при изменении только навыков", () => {
    fillRequiredFields("удаленная работа", null);
    const saved = Object.assign(new Vacancy(), {
      id: 81,
      ...uiService.vacancyForm.getRawValue(),
      salary: 100,
      requiredSkills: [skill],
    });
    uiService.applySetVacancies([saved]);
    uiService.applyEditVacancy(0);
    uiService.skills?.setValue([{ ...skill, id: 8 }]);
    service.submitVacancy(42);
    expect(updateVacancy).toHaveBeenCalledWith(
      81,
      expect.objectContaining({ salary: 100, requiredSkillsIds: [8] }),
    );
  });

  it.each<[string, number | null]>([
    ["", null],
    ["120 000", 120000],
  ])("нормализует зарплату %s без подмены пустого значения нулём", (salary, expected) => {
    fillRequiredFields("удаленная работа", null);
    uiService.salary?.setValue(salary);
    service.submitVacancy(42);
    expect(postVacancy).toHaveBeenCalledWith(42, expect.objectContaining({ salary: expected }));
  });

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
    fillRequiredFields("работа в офисе", "   ");
    uiService.workFormat?.setValue("удаленная работа");

    service.submitVacancy(42);

    expect(uiService.city?.value).toBeNull();
    expect(postVacancy).toHaveBeenCalledExactlyOnceWith(
      42,
      expect.objectContaining({ workFormat: "удаленная работа", city: null }),
    );
  });

  it("не вызывает создание вакансии для trim-пустого города", () => {
    fillRequiredFields("работа в офисе", "   ");

    service.submitVacancy(42);

    expect(uiService.city?.hasError("required")).toBe(true);
    expect(postVacancy).not.toHaveBeenCalled();
  });

  it("не вызывает обновление вакансии для trim-пустого города", () => {
    fillRequiredFields("смешанный формат", "\t");
    uiService.applySetVacancies([Object.assign(new Vacancy(), { id: 10 })]);
    editIndex.set(0);

    service.submitVacancy(42);

    expect(uiService.city?.hasError("required")).toBe(true);
    expect(updateVacancy).not.toHaveBeenCalled();
  });
});
