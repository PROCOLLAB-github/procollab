/** @format */

import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { FeedProject } from "@domain/feed/feed-item.model";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { NewProjectComponent } from "./new-project.component";

describe("NewProjectComponent", () => {
  it("показывает тип, дату, название, описание, индустрию и CTA", () => {
    TestBed.configureTestingModule({
      imports: [NewProjectComponent, RouterTestingModule],
      providers: [
        { provide: IndustryRepositoryPort, useValue: { getOne: () => ({ name: "Инженерия" }) } },
      ],
    });
    const fixture = TestBed.createComponent(NewProjectComponent);
    fixture.componentRef.setInput("feedItem", {
      id: 5,
      name: "Проект Б",
      shortDescription: "Краткое описание проекта",
      industry: 1,
      imageAddress: "",
      viewsCount: 0,
      leader: 2,
    } satisfies FeedProject);
    fixture.componentRef.setInput("publishedAt", "2026-09-23T12:00:00Z");
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector(".card__type")?.textContent?.trim()).toBe("Новый проект");
    expect(element.querySelector(".card__date")?.textContent?.trim()).toBe("23.09.2026");
    expect(element.querySelector(".card__title")?.textContent?.trim()).toBe("Проект Б");
    expect(element.querySelector(".card__description")?.textContent?.trim()).toBe(
      "Краткое описание проекта",
    );
    expect(element.querySelector(".card__industry")?.textContent?.trim()).toBe("Инженерия");
    expect(element.querySelector(".card__cta")?.textContent).toContain("Перейти в проект");
    expect(element.querySelector("a.card__cta")?.getAttribute("href")).toBe("/office/projects/5");
    expect(element.querySelector("time")?.getAttribute("datetime")).toBe("2026-09-23T12:00:00Z");
  });
});
