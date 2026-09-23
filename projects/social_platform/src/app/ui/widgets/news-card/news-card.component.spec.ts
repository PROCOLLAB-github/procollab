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
    expect(element.querySelector(".card__feed-cta")?.getAttribute("href")).toBe(
      "/office/profile/42",
    );
  });

  it("сохраняет лайк, ссылку на скачивание и полное имя источника в компактной ленте", () => {
    const name = "Очень длинное название проекта ".repeat(8);
    const news = {
      ...FeedNews.default(),
      name,
      text: "Заголовок новости. Подробности новости",
      files: [],
    };
    fixture.componentRef.setInput("feedItem", news);
    fixture.componentRef.setInput("feedType", "project");
    component.filesViewList = [
      { link: "/test.pdf", name: "Тестовый документ.pdf" },
    ] as typeof component.filesViewList;
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector(".feed-card__source-name")?.textContent).toBe(name);
    expect(root.querySelector(".feed-card__source-name")?.getAttribute("title")).toBe(name);
    expect(root.querySelector(".feed-card__title")?.textContent?.trim()).toBe("Заголовок новости.");
    expect(root.querySelector(".feed-card__description")?.textContent?.trim()).toBe(
      "Подробности новости",
    );
    const emit = vi.spyOn(component.like, "emit");
    root.querySelector<HTMLButtonElement>('button[aria-label="Нравится"]')!.click();
    expect(emit).toHaveBeenCalledExactlyOnceWith(news.id);
    expect(root.querySelector(".card__feed-files a")?.getAttribute("href")).toBe("/test.pdf");
    expect(root.querySelector(".card__feed-files a")?.getAttribute("download")).toBe(
      "Тестовый документ.pdf",
    );
  });

  it("вне ленты сохраняет обычную карточку и действия владельца", () => {
    fixture.componentRef.setInput("isOwner", true);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector(".card--feed")).toBeNull();
    expect(root.querySelector(".feed-card__cta")).toBeNull();
    expect(root.querySelector(".card__text")?.textContent).toContain(component.feedItem().text);
    root.querySelector<HTMLElement>(".card__dots")!.click();
    fixture.detectChanges();
    expect(root.querySelector(".card__options")?.textContent).toContain("редактировать");

    fixture.componentRef.setInput("feedType", "project");
    component.editMode = true;
    fixture.detectChanges();
    expect(root.querySelector(".card--feed")).toBeNull();
    expect(root.querySelector(".editor-footer")).not.toBeNull();
  });
});
