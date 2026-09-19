/** @format */

import { Component, input, output } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { By } from "@angular/platform-browser";
import { BehaviorSubject, of } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProgramDetailMainComponent } from "./main.component";
import { ProgramRoleWidgetComponent } from "./role-widget/program-role-widget.component";
import { NewsFormComponent } from "@ui/widgets/news-form/news-form.component";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { ProgramDetailMainService } from "@api/program/facades/detail/program-detail-main-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { NewsInfoService } from "@api/news/news-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { LoadingService } from "@api/shared/loading.service";
import { FetchNewsUseCase } from "@api/program/use-cases/fetch-news.use-case";
import { AddNewsUseCase } from "@api/program/use-cases/add-news.use-case";
import { ReadNewsUseCase } from "@api/program/use-cases/read-news.use-case";
import { DeleteNewsUseCase } from "@api/program/use-cases/delete-news.use-case";
import { EditNewsUseCase } from "@api/program/use-cases/edit-news.use-case";
import { ToggleLikeUseCase } from "@api/program/use-cases/toggle-like.use-case";
import { AcknowledgeProgramWelcomeUseCase } from "@api/program/use-cases/acknowledge-program-welcome.use-case";
import { Program } from "@domain/program/program.model";
import { FeedNews } from "@domain/news/project-news.model";
import { ok } from "@domain/shared/result.type";
import { signal } from "@angular/core";

@Component({ selector: "app-news-form", template: "Форма новости" })
class NewsFormStub {
  pending = input(false);
  addNews = output<{ text: string; files: string[] }>();
}
@Component({ selector: "app-news-card", template: "{{ feedItem().text }}" })
class NewsCardStub {
  feedItem = input.required<FeedNews>();
  resourceLink = input<unknown>();
  isOwner = input(false);
  like = output<number>();
  edited = output<FeedNews>();
  delete = output<number>();
}
@Component({ selector: "app-program-role-widget", template: "Виджет" })
class WidgetStub {}

describe("Program page: program-scoped news and role visibility", () => {
  const news = { ...FeedNews.default(), id: 1, text: "Существующая новость", files: [] };
  const added = { ...news, id: 2, text: "Созданная организатором новость" };
  const fetch = vi.fn(),
    add = vi.fn();
  let data: BehaviorSubject<{ data: Program }>;

  beforeEach(async () => {
    vi.useFakeTimers();
    data = new BehaviorSubject({ data: Program.default() });
    fetch.mockReset().mockReturnValue(of(ok({ count: 1, results: [news] })));
    add.mockReset().mockReturnValue(of(ok(added)));
    vi.spyOn(ProgramDetailMainService.prototype, "initScroll").mockImplementation(() => {});
    await TestBed.configureTestingModule({
      imports: [ProgramDetailMainComponent],
      providers: [
        provideRouter([]),
        ProgramDetailMainUIInfoService,
        NewsInfoService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ programId: 12 }),
            queryParams: of({}),
            data,
            snapshot: { params: { programId: 12 } },
          },
        },
        { provide: LoadingService, useValue: { hide: vi.fn() } },
        { provide: FetchNewsUseCase, useValue: { execute: fetch } },
        { provide: AddNewsUseCase, useValue: { execute: add } },
        {
          provide: ProjectAdditionalService,
          useValue: {
            isSend$: signal({ status: "initial" }),
            errorAssignProjectToProgramModalMessage: signal(null),
          },
        },
        ...[
          ReadNewsUseCase,
          DeleteNewsUseCase,
          EditNewsUseCase,
          ToggleLikeUseCase,
          AcknowledgeProgramWelcomeUseCase,
        ].map(provide => ({ provide, useValue: {} })),
      ],
    })
      .overrideComponent(ProgramDetailMainComponent, {
        remove: {
          imports: [NewsFormComponent, NewsCardComponent, ProgramRoleWidgetComponent],
          providers: [ExpandService],
        },
        add: {
          imports: [NewsFormStub, NewsCardStub, WidgetStub],
          providers: [
            {
              provide: ExpandService,
              useValue: {
                descriptionExpandable: signal(false),
                readFullDescription: signal(false),
                checkExpandable: vi.fn(),
              },
            },
          ],
        },
      })
      .compileComponents();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  function render(role: Partial<Program>) {
    data.next({
      data: {
        ...Program.default(),
        id: 12,
        isUserMember: false,
        isUserManager: false,
        isUserExpert: false,
        welcomeAcknowledgedAt: "2026-09-01T00:00:00Z",
        ...role,
      },
    });
    const fixture = TestBed.createComponent(ProgramDetailMainComponent);
    fixture.componentInstance["appWidth"] = 1280;
    fixture.detectChanges();
    return fixture;
  }
  it("loads and shows both existing and newly created news for manager without member role", () => {
    const f = render({ isUserManager: true });
    expect(fetch).toHaveBeenCalledExactlyOnceWith(10, 0, 12);
    expect(f.nativeElement.textContent).toContain(news.text);
    const form = f.debugElement.query(By.directive(NewsFormStub));
    expect(form).toBeTruthy();
    form.componentInstance.addNews.emit({ text: added.text, files: [] });
    f.detectChanges();
    expect(add).toHaveBeenCalledExactlyOnceWith(12, { text: added.text, files: [] });
    expect(f.nativeElement.textContent).toContain(added.text);
    expect(f.nativeElement.querySelectorAll("app-news-card")).toHaveLength(2);
  });
  it("keeps member news without granting the creation form", () => {
    const f = render({ isUserMember: true });
    expect(fetch).toHaveBeenCalledOnce();
    expect(f.nativeElement.textContent).toContain(news.text);
    expect(f.nativeElement.querySelector("app-news-form")).toBeNull();
  });
  it("shows expert widget without requesting or revealing member/manager news", () => {
    const f = render({ isUserExpert: true });
    TestBed.inject(NewsInfoService).applyAddNews(news);
    f.detectChanges();
    expect(f.nativeElement.querySelector("app-program-role-widget")).toBeTruthy();
    expect(f.nativeElement.querySelector("app-news-card,app-news-form")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("preserves advertisement and no internal content for an unrelated user", () => {
    const f = render({});
    expect(f.nativeElement.querySelector(".program__advertisement")).toBeTruthy();
    expect(
      f.nativeElement.querySelector("app-program-role-widget,app-news-card,app-news-form"),
    ).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
