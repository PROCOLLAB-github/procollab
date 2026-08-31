/** @format */

import {
  buildProjectDescriptionPreview,
  ProjectsMidSideComponent,
} from "./projects-mid-side.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProjectsDetailService } from "@api/project/facades/detail/projects-detail.service";
import { NewsInfoService } from "@api/news/news-info.service";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { signal } from "@angular/core";
import { Project } from "@domain/project/project.model";

describe("buildProjectDescriptionPreview", () => {
  it("не обрезает короткое описание", () => {
    expect(buildProjectDescriptionPreview("Короткое описание.", 100)).toBe("Короткое описание.");
  });

  it("обрезает длинное описание по границе целого предложения", () => {
    const description =
      "Первое законченное предложение. Второе законченное предложение. Третье предложение продолжается.";

    expect(buildProjectDescriptionPreview(description, 70)).toBe(
      "Первое законченное предложение. Второе законченное предложение.",
    );
  });

  it("использует границу слова и многоточие, если законченного предложения нет", () => {
    expect(buildProjectDescriptionPreview("Очень длинное описание без знаков завершения", 28)).toBe(
      "Очень длинное описание без…",
    );
  });
});

describe("ProjectsMidSideComponent", () => {
  let fixture: ComponentFixture<ProjectsMidSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsMidSideComponent],
      providers: [
        { provide: NewsInfoService, useValue: { news: signal([]) } },
        { provide: ProjectsDetailUIInfoService, useValue: { directions: signal([]) } },
        { provide: ProfileInfoService, useValue: { profile: signal(undefined) } },
      ],
    })
      .overrideComponent(ProjectsMidSideComponent, {
        remove: { providers: [ProjectsDetailService] },
        add: { providers: [{ provide: ProjectsDetailService, useValue: {} }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectsMidSideComponent);
  });

  it("shows the complete project description after expansion", () => {
    const tail = "УНИКАЛЬНЫЙ ФИНАЛ ОПИСАНИЯ";
    const description = `${"Длинное описание проекта без завершения. ".repeat(20)}${tail}`;
    fixture.componentRef.setInput("project", { id: 1, description } as Project);
    fixture.detectChanges();

    const paragraph = fixture.nativeElement.querySelector(".about__text p") as HTMLElement;
    const button = fixture.nativeElement.querySelector(".read-more") as HTMLButtonElement;
    expect(paragraph.textContent).not.toContain(tail);
    expect(button.textContent).toContain("Подробнее");

    button.click();
    fixture.detectChanges();

    expect(paragraph.textContent).toContain(tail);
    expect(button.textContent).toContain("Скрыть");

    button.click();
    fixture.detectChanges();
    expect(paragraph.textContent).not.toContain(tail);
    expect(button.textContent).toContain("Подробнее");
  });
});
