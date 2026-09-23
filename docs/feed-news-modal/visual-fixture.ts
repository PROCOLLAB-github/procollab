/** @format */

import "@angular/compiler";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { provideRouter, Router, RouterOutlet } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { API_URL } from "@corelib";
import { FeedComponent } from "../projects/social_platform/src/app/ui/pages/feed/feed.component";
import { FeedInfoService } from "@api/feed/facades/feed-info.service";
import { FeedUIInfoService } from "@api/feed/facades/ui/feed-ui-info.service";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { FeedNews } from "@domain/news/project-news.model";

const params = new URLSearchParams(location.search);
const long = params.has("extreme");
const avatar = "/assets/images/profile/main.svg";
const date = "2026-09-23T12:00:00Z";
const shapes = ["portrait", "square", "landscape", "wide", "panorama"];
const media = shapes.map(name => ({
  link: "/fixtures/" + name + ".svg",
  name: name + ".svg",
  mimeType: "image/svg+xml",
  size: 1024,
}));
const paragraph =
  "Новый этап помогает командам проверять идеи, обсуждать результаты и находить партнёров. Полный текст сохраняет все подробности и переносы строк.";
const project = {
  id: 51,
  name: "Команда цифровых решений",
  imageAddress: avatar,
  industry: 1,
  leader: 7,
  shortDescription: "Помогаем студентам находить команду.",
};
const news = (id: number, people: boolean, text: string, files: any[] = []) => ({
  typeModel: "news",
  publishedAt: date,
  content: {
    ...FeedNews.default(),
    id,
    name: people ? "Анна Смирнова" : project.name,
    imageAddress: avatar,
    text: long
      ? "ОченьДлинныйЗаголовокБезПробелов".repeat(8) + "\n" + (paragraph + "\n").repeat(80)
      : text,
    contentObject: people ? { id: 42, email: "fixture@example.test" } : project,
    files,
  },
});
const longText =
  "Запустили новый этап программы.\n" +
  paragraph +
  "\nПодробнее: https://example.test/news\n" +
  paragraph +
  "\n" +
  paragraph;
const vacancy = {
  typeModel: "vacancy",
  publishedAt: date,
  content: {
    id: 4,
    project,
    role: "Тестировщик (QA)",
    description: "Помогите проверить новую платформу.",
    requiredSkills: [
      { id: 1, name: "QA" },
      { id: 2, name: "API" },
    ],
  },
};
const items: any[] = [
  news(1, true, "Короткая новость."),
  news(2, true, "Делюсь иллюстрациями.", media),
  news(3, false, longText),
  vacancy,
  { typeModel: "project", publishedAt: date, content: { ...project, id: 5 } },
  news(6, false, longText, [
    media[3],
    { link: "/fixtures/notes.txt", name: "Описание проекта.txt", mimeType: "text/plain", size: 50 },
  ]),
];
if (params.has("odd")) items.pop();
const cropStyle = "";
const ui = new FeedUIInfoService();
ui.applyInitializationFeedNewsEvent({
  count: 6,
  next: "",
  previous: "",
  results: items,
  counts: { all: 86, project: 56, vacancy: 3, news: 27, partnerprogram: 0, education: 0 },
});
@Component({
  selector: "app-preview",
  imports: [RouterOutlet],
  styleUrls: ["../projects/social_platform/src/app/ui/pages/office/office.component.scss"],
  template: `<div [style]="cropStyle">
    <div class="office">
      <div class="office__wrapper">
        <div class="office__body">
          <div class="office__inner">
            <div class="office__inner--wrapper">
              <aside class="office__sidebar" style="padding-top:30px">
                <img src="/assets/images/shared/logo.svg" alt="PROCOLLAB" style="width:130px" />
                <p style="font-size:10px;color:var(--dark-grey);margin-top:24px">
                  Локальная проверка<br />Тестовые данные
                </p>
              </aside>
              <div class="office__inner--content"><router-outlet /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
})
class Preview {
  cropStyle = cropStyle;
}
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
TestBed.configureTestingModule({
  imports: [Preview],
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideNoopAnimations(),
    provideRouter([
      { path: "office/feed", component: FeedComponent },
      { path: "", redirectTo: "office/feed", pathMatch: "full" },
    ]),
    { provide: API_URL, useValue: "/fixture-api" },
    {
      provide: IndustryRepositoryPort,
      useValue: { getOne: () => ({ id: 1, name: "Entertainment Tech" }) },
    },
  ],
}).overrideComponent(FeedComponent, {
  set: {
    providers: [
      { provide: FeedUIInfoService, useValue: ui },
      {
        provide: FeedInfoService,
        useValue: {
          initializationFeedNews() {},
          initScroll() {},
          destroy() {},
          onLike(id: number) {
            const index = ui
              .feedItems()
              .findIndex(x => x.typeModel === "news" && x.content.id === id);
            ui.applyLikeNews(index);
          },
        },
      },
    ],
  },
});
TestBed.compileComponents().then(async () => {
  const fixture = TestBed.createComponent(Preview);
  document.body.appendChild(fixture.nativeElement);
  fixture.autoDetectChanges();
  await TestBed.inject(Router).navigateByUrl(location.pathname + location.search);
});
