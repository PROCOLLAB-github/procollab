/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ValidationService } from "@corelib";
import { workFormatList } from "@core/consts/lists/work-format-list.const";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { ProjectFormService } from "../project-form.service";
import { ToggleFieldsInfoService } from "../../../../toggle-fields/toggle-fields-info.service";
import { ProjectsEditUIInfoService } from "./projects-edit-ui-info.service";
import { ProjectVacancyUIService } from "./project-vacancy-ui.service";

describe("ProjectVacancyUIService", () => {
  let service: ProjectVacancyUIService;
  let validationService: ValidationService;

  const vacancy = (overrides: Partial<Vacancy> = {}): Vacancy =>
    Object.assign(new Vacancy(), {
      id: 1,
      role: "Разработчик",
      requiredSkills: [],
      description: "Описание",
      requiredExperience: "без опыта",
      workFormat: "удаленная работа",
      city: null,
      salary: "50000",
      workSchedule: "полный рабочий день",
      specialization: "IT",
      ...overrides,
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        ProjectVacancyUIService,
        { provide: ProjectFormService, useValue: { editIndex: signal<number | null>(null) } },
        ValidationService,
        { provide: ProjectsEditUIInfoService, useValue: { onEditClicked: signal(false) } },
        { provide: ToggleFieldsInfoService, useValue: { showFields: vi.fn() } },
      ],
    });

    service = TestBed.inject(ProjectVacancyUIService);
    validationService = TestBed.inject(ValidationService);
  });

  it("содержит nullable-контрол города", () => {
    expect(service.city).not.toBeNull();
    expect(service.city?.value).toBeNull();
  });

  it("не требует город для удаленной работы и очищает введенное значение", () => {
    service.workFormat?.setValue("работа в офисе");
    service.city?.setValue("Москва");

    service.workFormat?.setValue("удаленная работа");

    expect(service.city?.value).toBeNull();
    expect(service.city?.hasError("required")).toBe(false);
  });

  it.each(["работа в офисе", "смешанный формат"])("требует город для формата %s", workFormat => {
    service.workFormat?.setValue(workFormat);
    service.city?.setValue(null);

    expect(service.city?.hasError("required")).toBe(true);
  });

  it.each(["", " ", "   ", "\t"])("считает trim-пустой город %j невалидным для офиса", city => {
    service.workFormat?.setValue("работа в офисе");
    service.city?.setValue(city);

    expect(service.city?.hasError("required")).toBe(true);
    expect(service.vacancyForm.invalid).toBe(true);
    expect(validationService.getFormValidation(service.vacancyForm)).toBe(false);
  });

  it("считает trim-пустой город невалидным для смешанного формата", () => {
    service.workFormat?.setValue("смешанный формат");
    service.city?.setValue(" ");

    expect(service.city?.hasError("required")).toBe(true);
  });

  it("принимает город с внешними пробелами", () => {
    service.workFormat?.setValue("работа в офисе");
    service.city?.setValue(" Москва ");

    expect(service.city?.valid).toBe(true);
  });

  it("ограничивает город 255 символами независимо от формата", () => {
    service.city?.setValue("А".repeat(256));

    expect(service.city?.hasError("maxlength")).toBe(true);
  });

  it("очищает whitespace-город и снимает required для удаленной работы", () => {
    service.workFormat?.setValue("работа в офисе");
    service.city?.setValue("   ");

    service.workFormat?.setValue("удаленная работа");

    expect(service.city?.value).toBeNull();
    expect(service.city?.hasError("required")).toBe(false);
  });

  it("сохраняет город при переключении между офисом и смешанным форматом", () => {
    service.workFormat?.setValue("работа в офисе");
    service.city?.setValue("Казань");

    service.workFormat?.setValue("смешанный формат");

    expect(service.city?.value).toBe("Казань");
  });

  it.each([
    ["работа в офисе", "Москва"],
    ["смешанный формат", "Санкт-Петербург"],
  ])("восстанавливает город при редактировании формата %s", (workFormat, city) => {
    service.applySetVacancies([vacancy({ workFormat, city })]);

    expect(() => service.applyEditVacancy(0)).not.toThrow();
    expect(service.workFormat?.value).toBe(workFormat);
    expect(service.city?.value).toBe(city);
    expect(service.city?.hasError("required")).toBe(false);
  });

  it("без ошибки открывает legacy-вакансию без города для удаленной работы", () => {
    service.applySetVacancies([vacancy({ city: null })]);

    expect(() => service.applyEditVacancy(0)).not.toThrow();
    expect(service.city?.value).toBeNull();
    expect(service.isCityRequired()).toBe(false);
  });

  it("использует canonical-значение смешанного формата", () => {
    expect(workFormatList.some(item => item.value === "смешанный формат")).toBe(true);
    expect(workFormatList.some(item => item.value === "смешанная")).toBe(false);
  });
});
