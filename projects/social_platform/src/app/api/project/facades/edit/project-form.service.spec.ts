/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { ProjectFormService } from "./project-form.service";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import { Project } from "@domain/project/project.model";

describe("ProjectFormService", () => {
  let service: ProjectFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectFormService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { projectId: "42" } } },
        },
        {
          provide: UpdateFormUseCase,
          useValue: { execute: jasmine.createSpy("execute").and.returnValue(of({ ok: true })) },
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
});
