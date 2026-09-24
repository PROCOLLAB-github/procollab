/** @format */

import { By } from "@angular/platform-browser";
import { firstValueFrom } from "rxjs";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL } from "@corelib";
import { FeedInfoService } from "@api/feed/facades/feed-info.service";
import { FeedUIInfoService } from "@api/feed/facades/ui/feed-ui-info.service";
import { FeedItem, FeedProject } from "@domain/feed/feed-item.model";
import { FeedNews } from "@domain/news/project-news.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { success } from "@domain/shared/async-state";
import { FeedComponent } from "./feed.component";

describe("FeedComponent: порядок и представление карточек #372", () => {
  const project: FeedProject = {
    id: 1,
    name: "Проект",
    shortDescription: "Описание",
    imageAddress: "",
    industry: 1,
    leader: 7,
    viewsCount: 0,
  };
  const date = "2026-08-29T12:00:00Z";
  const news = {
    ...FeedNews.default(),
    id: 1,
    name: "Источник",
    text: "Первая строка. Подробности",
    files: [],
    contentObject: { id: 1, industry: 1 },
  };
  const initial: FeedItem[] = [
    {
      typeModel: "vacancy",
      publishedAt: date,
      content: {
        id: 1,
        project,
        role: "QA",
        description: "Задачи",
        requiredSkills: [],
      } as unknown as Vacancy,
    },
    { typeModel: "news", publishedAt: date, content: news },
    { typeModel: "project", publishedAt: date, content: project },
    {
      typeModel: "news",
      publishedAt: date,
      content: { ...news, id: 2, contentObject: { id: 42, email: "fixture@example.test" } },
    },
    { typeModel: "project", publishedAt: date, content: { ...project, id: 2 } },
    { typeModel: "project", publishedAt: date, content: { ...project, id: 3 } },
  ];

  it("сохраняет шесть начальных карточек, ключи type:id и append в DOM без перестановки", async () => {
    const ui = new FeedUIInfoService();
    ui.applyInitializationFeedNewsEvent({ count: 12, next: "", previous: "", results: initial });
    await TestBed.configureTestingModule({
      imports: [FeedComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: API_URL, useValue: "" },
        { provide: IndustryRepositoryPort, useValue: { getOne: () => ({ name: "IT" }) } },
      ],
    })
      .overrideComponent(FeedComponent, {
        set: {
          providers: [
            { provide: FeedUIInfoService, useValue: ui },
            {
              provide: FeedInfoService,
              useValue: {
                initializationFeedNews: vi.fn(),
                initScroll: vi.fn(),
                destroy: vi.fn(),
                onLike(id: number) {
                  ui.applyLikeNews(
                    ui
                      .feedItems()
                      .findIndex(item => item.typeModel === "news" && item.content.id === id),
                  );
                },
              },
            },
          ],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const cards = () => Array.from(root.querySelectorAll<HTMLElement>(".page__item"));
    const before = cards();
    expect(before.map(card => card.dataset["key"])).toEqual([
      "vacancy:1",
      "news:1",
      "project:1",
      "news:2",
      "project:2",
      "project:3",
    ]);
    expect(
      before.slice(0, 4).map(card => card.querySelector(".feed-card__type")?.textContent?.trim()),
    ).toEqual(["Новая вакансия", "Новости проекта", "Новый проект", "Новости людей"]);
    expect(
      before.every(card => card.querySelector("time")?.getAttribute("datetime") === date),
    ).toBe(true);
    expect(before[3].querySelector(".feed-card__cta")?.getAttribute("href")).toBe(
      "/office/profile/42",
    );

    const next: FeedItem[] = [4, 5, 6, 7, 8, 9].map(id => ({
      typeModel: "project",
      content: { ...project, id },
      publishedAt: date,
    }));
    ui.feedItems$.set(success([...initial, ...next]));
    fixture.detectChanges();
    expect(cards()).toHaveLength(12);
    expect(cards().slice(0, 6)).toEqual(before);
    expect(
      cards()
        .slice(6)
        .map(card => card.dataset["key"]),
    ).toEqual(["project:4", "project:5", "project:6", "project:7", "project:8", "project:9"]);
    expect(ui.perFetchTake()).toBe(6);
    const article = root.querySelector<HTMLElement>('[data-key="news:1"] article')!;
    article.click();
    fixture.detectChanges();
    const primitive = fixture.debugElement.query(By.directive(ModalComponent))
      .componentInstance as ModalComponent;
    await firstValueFrom(primitive.overlayRef!.attachments());
    await fixture.whenStable();
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    const previous = initial[1].content as FeedNews;
    dialog.querySelector<HTMLButtonElement>('[aria-label="Нравится"]')!.click();
    await fixture.whenStable();
    expect(article.querySelector('[aria-label="Нравится"]')?.getAttribute("aria-pressed")).toBe(
      String(!previous.isUserLiked),
    );
    expect(dialog.querySelector('[aria-label="Нравится"]')?.getAttribute("aria-pressed")).toBe(
      String(!previous.isUserLiked),
    );
    expect((ui.feedItems()[1].content as FeedNews).viewsCount).toBe(previous.viewsCount);
    expect(cards()).toHaveLength(12);
  });
});
