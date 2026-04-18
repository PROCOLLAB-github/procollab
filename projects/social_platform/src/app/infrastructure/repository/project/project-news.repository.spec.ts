/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectNewsRepository } from "./project-news.repository";
import { ProjectNewsHttpAdapter } from "../../adapters/project/project-news-http.adapter";
import { StorageService } from "@api/storage/storage.service";
import { FeedNews } from "@domain/project/project-news.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("ProjectNewsRepository", () => {
  let repository: ProjectNewsRepository;
  let adapter: jasmine.SpyObj<ProjectNewsHttpAdapter>;
  let storage: jasmine.SpyObj<StorageService>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProjectNewsHttpAdapter>("ProjectNewsHttpAdapter", [
      "fetchNews",
      "fetchNewsDetail",
      "addNews",
      "setNewsViewed",
      "deleteNews",
      "toggleLike",
      "editNews",
    ]);
    storage = jasmine.createSpyObj<StorageService>("StorageService", ["getItem", "setItem"]);
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

  it("fetchNews делегирует в adapter и мапит results в FeedNews", done => {
    setup();
    adapter.fetchNews.and.returnValue(of(page()));

    repository.fetchNews("42").subscribe(res => {
      expect(adapter.fetchNews).toHaveBeenCalledOnceWith("42");
      expect(res.results[0]).toBeInstanceOf(FeedNews);
      done();
    });
  });

  it("fetchNewsDetail мапит в FeedNews", done => {
    setup();
    adapter.fetchNewsDetail.and.returnValue(of({ id: 1 } as FeedNews));
    repository.fetchNewsDetail("p1", "n1").subscribe(n => {
      expect(adapter.fetchNewsDetail).toHaveBeenCalledOnceWith("p1", "n1");
      expect(n).toBeInstanceOf(FeedNews);
      done();
    });
  });

  it("addNews мапит в FeedNews", done => {
    setup();
    adapter.addNews.and.returnValue(of({ id: 1 } as FeedNews));
    repository.addNews("p1", { text: "t", files: [] }).subscribe(n => {
      expect(adapter.addNews).toHaveBeenCalledOnceWith("p1", { text: "t", files: [] });
      expect(n).toBeInstanceOf(FeedNews);
      done();
    });
  });

  it("readNews вызывает setNewsViewed только для непрочитанных", done => {
    setup();
    storage.getItem.and.returnValue([1]);
    adapter.setNewsViewed.and.returnValue(of(undefined));

    repository.readNews(10, [1, 2]).subscribe(() => {
      expect(adapter.setNewsViewed).toHaveBeenCalledTimes(1);
      expect(adapter.setNewsViewed).toHaveBeenCalledWith(10, 2);
      done();
    });
  });

  it("readNews возвращает [] если все прочитаны", done => {
    setup();
    storage.getItem.and.returnValue([1, 2]);
    repository.readNews(10, [1, 2]).subscribe(res => {
      expect(res).toEqual([]);
      expect(adapter.setNewsViewed).not.toHaveBeenCalled();
      done();
    });
  });

  it("delete делегирует в adapter", () => {
    setup();
    adapter.deleteNews.and.returnValue(of(undefined));
    repository.delete("p1", 5).subscribe();
    expect(adapter.deleteNews).toHaveBeenCalledOnceWith("p1", 5);
  });

  it("toggleLike делегирует в adapter", () => {
    setup();
    adapter.toggleLike.and.returnValue(of(undefined));
    repository.toggleLike("p1", 5, true).subscribe();
    expect(adapter.toggleLike).toHaveBeenCalledOnceWith("p1", 5, true);
  });

  it("editNews мапит в FeedNews", done => {
    setup();
    adapter.editNews.and.returnValue(of({ id: 5 } as FeedNews));
    repository.editNews("p1", 5, { text: "t" }).subscribe(n => {
      expect(adapter.editNews).toHaveBeenCalledOnceWith("p1", 5, { text: "t" });
      expect(n).toBeInstanceOf(FeedNews);
      done();
    });
  });
});
