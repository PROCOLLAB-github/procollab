/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectFormService } from "./project-form.service";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import { Project } from "@domain/project/project.model";

describe("ProjectFormService", () => {
  let service: ProjectFormService;
  let update: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.removeItem("project-autosave-queue");
    update = vi.fn().mockReturnValue(of({ ok: true }));
    TestBed.configureTestingModule({
      providers: [
        ProjectFormService,
        {
          provide: UpdateFormUseCase,
          useValue: { execute: update },
        },
      ],
    });

    service = TestBed.inject(ProjectFormService);
  });

  it("заполняет форму и массивы данными проекта", () => {
    const project = Project.default();
    project.name = "AI Platform";
    project.region = "Moscow";
    project.industry = 12;
    project.description = "Project description";
    project.targetAudience = "Students";
    project.actuality = "Important";
    project.trl = "4";
    project.problem = "Problem";
    project.presentationAddress = "https://example.com/presentation";
    project.coverImageAddress = "https://example.com/cover.png";
    project.links = ["https://example.com", "https://github.com/example"];
    project.achievements = [
      { id: 11, title: "Pilot", status: "2024" },
      { id: 12, title: "Launch", status: "2025" },
    ];
    project.partnerProgram = {
      id: 5,
      programId: 9,
      programLinkId: 17,
      isSubmitted: false,
      canSubmit: true,
      programFields: [],
      programFieldValues: [],
    };

    service.initializeProjectData(project);

    const form = service.getForm();

    expect(form.get("name")?.value).toBe("AI Platform");
    expect(form.get("region")?.value).toBe("Moscow");
    expect(form.get("industryId")?.value).toBe(12);
    expect(form.get("presentationAddress")?.value).toBe("https://example.com/presentation");
    expect(service.links.length).toBe(2);
    expect(service.links.at(0).value).toBe("https://example.com");
    expect(service.achievements.length).toBe(2);
    expect(service.achievements.at(1).get("title")?.value).toBe("Launch");
    expect(service.relationId()).toBe(17);
  });

  it("очищает старые элементы form array перед повторной инициализацией", () => {
    const firstProject = Project.default();
    firstProject.links = ["https://first.example"];
    firstProject.achievements = [{ id: 1, title: "First", status: "2024" }];

    const secondProject = Project.default();
    secondProject.links = ["https://second.example"];
    secondProject.achievements = [{ id: 2, title: "Second", status: "2025" }];

    service.initializeProjectData(firstProject);
    service.initializeProjectData(secondProject);

    expect(service.links.length).toBe(1);
    expect(service.links.at(0).value).toBe("https://second.example");
    expect(service.achievements.length).toBe(1);
    expect(service.achievements.at(0).get("title")?.value).toBe("Second");
  });

  it("нормализует безопасные различия регистра и пробелов", () => {
    const project = Project.default();
    project.region = "  мОскВа ";

    service.initializeProjectData(project);

    expect(service.region?.value).toBe("Москва");
    expect(service.region?.valid).toBe(true);
  });

  it("сохраняет неизвестное legacy-значение без потери при открытии формы", () => {
    const project = Project.default();
    project.region = "Миксва";

    service.initializeProjectData(project);

    expect(service.region?.value).toBe("Миксва");
    expect(service.region?.valid).toBe(true);
  });

  it("начальное заполнение пустых файлов не отправляет cleanup и сохраняет события обычных полей", () => {
    const project = {
      ...Project.default(),
      id: 31,
      presentationAddress: "",
      coverImageAddress: "",
    };
    const nameChanged = vi.fn();
    service.name!.valueChanges.subscribe(nameChanged);
    service.initializeProjectData(project);
    expect(update).not.toHaveBeenCalled();
    expect(nameChanged).toHaveBeenCalledWith(project.name);
    expect(service.getFormValue()).not.toHaveProperty("presentationAddress");
    expect(service.getFormValue()).not.toHaveProperty("coverImageAddress");
  });

  it.each(["presentationAddress", "coverImageAddress"] as const)(
    "намеренная очистка %s сохраняется в явном payload и autosave",
    field => {
      service.initializeProjectData({
        ...Project.default(),
        id: 31,
        [field]: "https://example.test/file",
      });
      service.getForm().get(field)!.setValue("");
      expect(service.getFormValue()[field]).toBe("");
      expect(update).toHaveBeenCalledExactlyOnceWith({
        id: 31,
        data: { [field]: "", draft: true },
      });
    },
  );

  it("помнит удаление файла, загруженного после открытия изначально пустой формы", () => {
    service.initializeProjectData({ ...Project.default(), id: 31, presentationAddress: "" });
    service.presentationAddress!.setValue("https://example.test/new-file");
    service.presentationAddress!.setValue("");
    expect(service.getFormValue().presentationAddress).toBe("");
  });

  it("замена удалённого файла отправляет новый URL вместо команды очистки", () => {
    service.initializeProjectData({ ...Project.default(), id: 31 });
    service.presentationAddress!.setValue("");
    service.presentationAddress!.setValue("https://example.test/replacement");
    expect(service.getFormValue().presentationAddress).toBe("https://example.test/replacement");
  });

  it("при смене проекта сбрасывает историю файлов и использует новый Project.id", () => {
    service.initializeProjectData({ ...Project.default(), id: 31 });
    service.presentationAddress!.setValue("");
    service.initializeProjectData({
      ...Project.default(),
      id: 32,
      presentationAddress: "",
      coverImageAddress: "https://example.test/cover-32",
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(service.getFormValue()).not.toHaveProperty("presentationAddress");
    service.coverImageAddress!.setValue("");
    expect(update).toHaveBeenLastCalledWith({
      id: 32,
      data: { coverImageAddress: "", draft: true },
    });
  });

  it("не смешивает projectId и programLinkId", () => {
    service.initializeProjectData({
      ...Project.default(),
      id: 31,
      partnerProgram: {
        id: 73,
        programId: 21,
        programLinkId: 73,
        isSubmitted: false,
        canSubmit: true,
        programFields: [],
        programFieldValues: [],
      },
    });
    service.presentationAddress!.setValue("");
    expect(service.relationId()).toBe(73);
    expect(update).toHaveBeenCalledExactlyOnceWith({
      id: 31,
      data: { presentationAddress: "", draft: true },
    });
  });

  it("сохраняет прежнюю семантику stripNullish для обычных полей и значения false/0", () => {
    service.initializeProjectData({ ...Project.default(), id: 31, presentationAddress: "" });
    service.getForm().patchValue({
      name: "Название",
      description: "",
      actuality: "  ",
      problem: null,
      trl: undefined,
      draft: false,
      industryId: 0,
    });
    const payload = service.getFormValue();
    expect(payload).toMatchObject({ name: "Название", draft: false, industryId: 0 });
    for (const field of ["description", "actuality", "problem", "trl", "presentationAddress"]) {
      expect(payload).not.toHaveProperty(field);
    }
  });

  it("reset и destroy не вызывают позднюю очистку прежнего проекта", () => {
    service.initializeProjectData({ ...Project.default(), id: 31 });
    service.resetForms();
    service.presentationAddress!.setValue("");
    expect(update).not.toHaveBeenCalled();
    expect(service.getFormValue()).not.toHaveProperty("presentationAddress");
    service.initializeProjectData({ ...Project.default(), id: 32 });
    TestBed.resetTestingModule();
    service.presentationAddress!.setValue("");
    expect(update).not.toHaveBeenCalled();
  });
});
