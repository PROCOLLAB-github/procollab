/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectNewsRepository } from "./project-news.repository";
import { ProjectNewsHttpAdapter } from "../../adapters/project/project-news-http.adapter";
import { StorageService } from "@domain/shared/storage.service";
import { FeedNews } from "@domain/news/project-news.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("ProjectNewsRepository", () => {
  let repository: ProjectNewsRepository;
  let adapter: any;
  let storage: any;

  function setup(): void {
    adapter = {
      fetchNews: vi.fn(),
      fetchNewsDetail: vi.fn(),
      addNews: vi.fn(),
      setNewsViewed: vi.fn(),
      deleteNews: vi.fn(),
      toggleLike: vi.fn(),
      editNews: vi.fn(),
    };
    storage = { getItem: vi.fn(), setItem: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        ProjectNewsRepository,
        { provide: ProjectNewsHttpAdapter, useValue: adapter },
        { provide: StorageService, useValue: storage },
      ],
    });
    repository = TestBed.inject(ProjectNewsRepository);
  }

  const page = (): ApiPagination<FeedNews> => ({
    count: 1,
    next: "",
    previous: "",
    results: [{ id: 1 } as FeedNews],
  });

  it("fetchNews делегирует в adapter и мапит results в FeedNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.fetchNews.mockReturnValue(of(page()));

      repository.fetchNews("42").subscribe(res => {
        expect(adapter.fetchNews).toHaveBeenCalledExactlyOnceWith("42");
        expect(res.results[0]).toBeInstanceOf(FeedNews);
        done();
      });
    }));

  it("fetchNewsDetail мапит в FeedNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.fetchNewsDetail.mockReturnValue(of({ id: 1 } as FeedNews));
      repository.fetchNewsDetail("p1", "n1").subscribe(n => {
        expect(adapter.fetchNewsDetail).toHaveBeenCalledExactlyOnceWith("p1", "n1");
        expect(n).toBeInstanceOf(FeedNews);
        done();
      });
    }));

  it("addNews мапит в FeedNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.addNews.mockReturnValue(of({ id: 1 } as FeedNews));
      repository.addNews("p1", { text: "t", files: [] }).subscribe(n => {
        expect(adapter.addNews).toHaveBeenCalledExactlyOnceWith("p1", { text: "t", files: [] });
        expect(n).toBeInstanceOf(FeedNews);
        done();
      });
    }));

  it("readNews вызывает setNewsViewed только для непрочитанных", () =>
    new Promise<void>(done => {
      setup();
      storage.getItem.mockReturnValue([1]);
      adapter.setNewsViewed.mockReturnValue(of(undefined));

      repository.readNews(10, [1, 2]).subscribe(() => {
        expect(adapter.setNewsViewed).toHaveBeenCalledTimes(1);
        expect(adapter.setNewsViewed).toHaveBeenCalledWith(10, 2);
        done();
      });
    }));

  it("readNews возвращает [] если все прочитаны", () =>
    new Promise<void>(done => {
      setup();
      storage.getItem.mockReturnValue([1, 2]);
      repository.readNews(10, [1, 2]).subscribe(res => {
        expect(res).toEqual([]);
        expect(adapter.setNewsViewed).not.toHaveBeenCalled();
        done();
      });
    }));

  it("delete делегирует в adapter", () => {
    setup();
    adapter.deleteNews.mockReturnValue(of(undefined));
    repository.delete("p1", 5).subscribe();
    expect(adapter.deleteNews).toHaveBeenCalledExactlyOnceWith("p1", 5);
  });

  it("toggleLike делегирует в adapter", () => {
    setup();
    adapter.toggleLike.mockReturnValue(of(undefined));
    repository.toggleLike("p1", 5, true).subscribe();
    expect(adapter.toggleLike).toHaveBeenCalledExactlyOnceWith("p1", 5, true);
  });

  it("editNews мапит в FeedNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.editNews.mockReturnValue(of({ id: 5 } as FeedNews));
      repository.editNews("p1", 5, { text: "t" }).subscribe(n => {
        expect(adapter.editNews).toHaveBeenCalledExactlyOnceWith("p1", 5, { text: "t" });
        expect(n).toBeInstanceOf(FeedNews);
        done();
      });
    }));
});
