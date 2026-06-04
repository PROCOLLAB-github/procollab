/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProgramNewsRepository } from "./program-news.repository";
import { ProgramNewsHttpAdapter } from "../../adapters/program/program-news-http.adapter";
import { FeedNews } from "@domain/news/project-news.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("ProgramNewsRepository", () => {
  let repository: ProgramNewsRepository;
  let adapter: any;

  function setup(): void {
    adapter = {
      fetchNews: vi.fn(),
      setNewsViewed: vi.fn(),
      toggleLike: vi.fn(),
      addNews: vi.fn(),
      editNews: vi.fn(),
      deleteNews: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [ProgramNewsRepository, { provide: ProgramNewsHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(ProgramNewsRepository);
  }

  const page = (): ApiPagination<FeedNews> => ({
    count: 1,
    next: "",
    previous: "",
    results: [{ id: 1 } as FeedNews],
  });

  it("fetchNews делегирует в adapter и мапит results", () =>
    new Promise<void>(done => {
      setup();
      adapter.fetchNews.mockReturnValue(of(page()));

      repository.fetchNews("10", 0, 42).subscribe(res => {
        expect(adapter.fetchNews).toHaveBeenCalledExactlyOnceWith(10, 0, 42);
        expect(res.results[0]).toBeInstanceOf(FeedNews);
        done();
      });
    }));

  it("readNews вызывает setNewsViewed на каждый id", () =>
    new Promise<void>(done => {
      setup();
      adapter.setNewsViewed.mockReturnValue(of(undefined));

      repository.readNews(1, [1, 2]).subscribe(() => {
        expect(adapter.setNewsViewed).toHaveBeenCalledWith("1", 1);
        expect(adapter.setNewsViewed).toHaveBeenCalledWith("1", 2);
        done();
      });
    }));

  it("toggleLike делегирует в adapter", () => {
    setup();
    adapter.toggleLike.mockReturnValue(of(undefined));
    repository.toggleLike("p1", 5, true).subscribe();
    expect(adapter.toggleLike).toHaveBeenCalledExactlyOnceWith("p1", 5, true);
  });

  it("addNews мапит ответ в FeedNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.addNews.mockReturnValue(of({ id: 1 } as FeedNews));

      repository.addNews("42", { text: "t", files: [] }).subscribe(news => {
        expect(adapter.addNews).toHaveBeenCalledExactlyOnceWith(42, { text: "t", files: [] });
        expect(news).toBeInstanceOf(FeedNews);
        done();
      });
    }));

  it("editNews мапит ответ в FeedNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.editNews.mockReturnValue(of({ id: 5 } as FeedNews));

      repository.editNews("42", 5, { text: "t" }).subscribe(news => {
        expect(adapter.editNews).toHaveBeenCalledExactlyOnceWith(42, 5, { text: "t" });
        expect(news).toBeInstanceOf(FeedNews);
        done();
      });
    }));

  it("delete делегирует в adapter", () => {
    setup();
    adapter.deleteNews.mockReturnValue(of(undefined));
    repository.delete("42", 5).subscribe();
    expect(adapter.deleteNews).toHaveBeenCalledExactlyOnceWith(42, 5);
  });
});
