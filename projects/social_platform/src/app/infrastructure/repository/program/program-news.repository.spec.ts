/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProgramNewsRepository } from "./program-news.repository";
import { ProgramNewsHttpAdapter } from "../../adapters/program/program-news-http.adapter";
import { FeedNews } from "@domain/project/project-news.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("ProgramNewsRepository", () => {
  let repository: ProgramNewsRepository;
  let adapter: jasmine.SpyObj<ProgramNewsHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProgramNewsHttpAdapter>("ProgramNewsHttpAdapter", [
      "fetchNews",
      "setNewsViewed",
      "toggleLike",
      "addNews",
      "editNews",
      "deleteNews",
    ]);
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

  it("fetchNews делегирует в adapter и мапит results", done => {
    setup();
    adapter.fetchNews.and.returnValue(of(page()));

    repository.fetchNews(10, 0, 42).subscribe(res => {
      expect(adapter.fetchNews).toHaveBeenCalledOnceWith(10, 0, 42);
      expect(res.results[0]).toBeInstanceOf(FeedNews);
      done();
    });
  });

  it("readNews вызывает setNewsViewed на каждый id", done => {
    setup();
    adapter.setNewsViewed.and.returnValue(of(undefined));

    repository.readNews("p1", [1, 2]).subscribe(() => {
      expect(adapter.setNewsViewed).toHaveBeenCalledWith("p1", 1);
      expect(adapter.setNewsViewed).toHaveBeenCalledWith("p1", 2);
      done();
    });
  });

  it("toggleLike делегирует в adapter", () => {
    setup();
    adapter.toggleLike.and.returnValue(of(undefined));
    repository.toggleLike("p1", 5, true).subscribe();
    expect(adapter.toggleLike).toHaveBeenCalledOnceWith("p1", 5, true);
  });

  it("addNews мапит ответ в FeedNews", done => {
    setup();
    adapter.addNews.and.returnValue(of({ id: 1 } as FeedNews));

    repository.addNews(42, { text: "t", files: [] }).subscribe(news => {
      expect(adapter.addNews).toHaveBeenCalledOnceWith(42, { text: "t", files: [] });
      expect(news).toBeInstanceOf(FeedNews);
      done();
    });
  });

  it("editNews мапит ответ в FeedNews", done => {
    setup();
    adapter.editNews.and.returnValue(of({ id: 5 } as FeedNews));

    repository.editNews(42, 5, { text: "t" }).subscribe(news => {
      expect(adapter.editNews).toHaveBeenCalledOnceWith(42, 5, { text: "t" });
      expect(news).toBeInstanceOf(FeedNews);
      done();
    });
  });

  it("deleteNews делегирует в adapter", () => {
    setup();
    adapter.deleteNews.and.returnValue(of(undefined));
    repository.deleteNews(42, 5).subscribe();
    expect(adapter.deleteNews).toHaveBeenCalledOnceWith(42, 5);
  });
});
