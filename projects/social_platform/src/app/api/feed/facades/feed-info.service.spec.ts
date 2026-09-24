/** @format */

import { ElementRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { FeedInfoService } from "./feed-info.service";
import { FeedUIInfoService } from "./ui/feed-ui-info.service";
import { FetchFeedUseCase } from "../use-cases/fetch-feed.use-case";
import { ReadFeedNewsUseCase } from "../use-cases/read-feed-news.use-case";
import { ToggleFeedLikeUseCase } from "../use-cases/toggle-feed-like.use-case";
import { FeedItem } from "@domain/feed/feed-item.model";
import { ok } from "@domain/shared/result.type";

describe("FeedInfoService", () => {
  const item = (id: number): FeedItem => ({
    typeModel: "project",
    content: {
      id,
      name: `Проект ${id}`,
      shortDescription: "",
      industry: 1,
      imageAddress: "",
      viewsCount: 0,
      leader: 1,
    },
  });

  function setup(nextIds: number[]) {
    const fetch = { execute: vi.fn() };
    const toggle = { execute: vi.fn().mockReturnValue(of(ok(undefined))) };
    fetch.execute.mockReturnValue(
      of(
        ok({
          count: 12,
          results: nextIds.map(item),
          next: "",
          previous: "",
        }),
      ),
    );
    TestBed.configureTestingModule({
      providers: [
        FeedInfoService,
        FeedUIInfoService,
        { provide: ActivatedRoute, useValue: {} },
        { provide: FetchFeedUseCase, useValue: fetch },
        { provide: ReadFeedNewsUseCase, useValue: {} },
        { provide: ToggleFeedLikeUseCase, useValue: toggle },
      ],
    });
    const ui = TestBed.inject(FeedUIInfoService);
    ui.applyInitializationFeedNewsEvent({
      count: 12,
      results: [1, 2, 3, 4, 5, 6].map(item),
      next: "",
      previous: "",
    });

    const target = document.createElement("div");
    const root = document.createElement("div");
    target.getBoundingClientRect = () => ({ bottom: 600 }) as DOMRect;
    root.getBoundingClientRect = () => ({ bottom: 700 }) as DOMRect;
    const service = TestBed.inject(FeedInfoService);
    service.initScroll(target, new ElementRef(root));

    return { ui, fetch, toggle, service, target };
  }

  it("догружает шесть элементов в конец в исходном порядке", () => {
    const { ui, fetch, target } = setup([7, 8, 9, 10, 11, 12]);

    target.dispatchEvent(new Event("scroll"));

    expect(fetch.execute).toHaveBeenCalledOnce();
    expect(fetch.execute.mock.calls[0].slice(0, 2)).toEqual([6, 6]);
    expect(ui.feedItems().map(entry => entry.content.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(ui.feedPage()).toBe(12);
  });

  it("не переставляет старые карточки при дубликате на границе страниц", () => {
    const { ui, target } = setup([6, 7, 8, 9, 10, 11]);

    target.dispatchEvent(new Event("scroll"));

    expect(ui.feedItems().map(entry => entry.content.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    expect(ui.feedPage()).toBe(12);
  });

  it("обрабатывает лайк новости при совпадении её id с id проекта", () => {
    const { ui, toggle, service } = setup([]);
    const news = {
      typeModel: "news",
      content: {
        id: 1,
        contentObject: { id: 42, email: "user@example.com" },
        isUserLiked: false,
        likesCount: 0,
      },
    } as FeedItem;
    ui.applyInitializationFeedNewsEvent({
      count: 2,
      results: [item(1), news],
      next: "",
      previous: "",
    });

    service.onLike(1);

    expect(toggle.execute).toHaveBeenCalledOnce();
    expect(ui.feedItems()[0].typeModel).toBe("project");
    const likedItem = ui.feedItems()[1];
    expect(likedItem.typeModel).toBe("news");
    if (likedItem.typeModel === "news") {
      expect(likedItem.content.isUserLiked).toBe(true);
    }
  });
});
