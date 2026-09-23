/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewsCardComponent } from "./news-card.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { ProjectNewsRepository as ProjectNewsService } from "@infrastructure/repository/project/project-news.repository";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DayjsPipe } from "projects/core";
import { FeedNews } from "@domain/news/project-news.model";
import { API_URL } from "@corelib";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

describe("NewsCardComponent", () => {
  let component: NewsCardComponent;
  let fixture: ComponentFixture<NewsCardComponent>;

  beforeEach(async () => {
    const projectNewsServiceSpy = { addNews: vi.fn() };
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NewsCardComponent,
        DayjsPipe,
      ],
      providers: [
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
        { provide: AuthRepository, useValue: authSpy },
        { provide: API_URL, useValue: "" },
        { provide: IndustryRepositoryPort, useValue: { getOne: () => ({ name: "IT" }) } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("feedItem", FeedNews.default());
    fixture.componentRef.setInput("resourceLink", ["office", "projects", 1, "news"]);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("в ленте показывает тип новости проекта, дату, индустрию и переход", () => {
    fixture.componentRef.setInput("feedType", "project");
    fixture.componentRef.setInput("feedIndustryId", 1);
    fixture.componentRef.setInput("publishedAt", "2026-09-23T12:00:00Z");
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector(".card__feed-type")?.textContent?.trim()).toBe("Новости проекта");
    expect(element.querySelector(".card__feed-date")?.textContent?.trim()).toBe("23.09.2026");
    expect(element.querySelector(".card__feed-industry")?.textContent?.trim()).toBe("IT");
    expect(element.querySelector(".card__feed-cta")?.textContent?.trim()).toBe("Перейти в проект");
  });

  it("в ленте показывает тип новости человека и переход в профиль", () => {
    fixture.componentRef.setInput("feedType", "people");
    fixture.componentRef.setInput("resourceLink", ["/office/profile/42"]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector(".card__feed-type")?.textContent?.trim()).toBe("Новости людей");
    expect(element.querySelector(".card__feed-cta")?.textContent?.trim()).toBe("Перейти в профиль");
  });
});
