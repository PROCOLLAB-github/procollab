/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProfileNewsRepository } from "./profile-news.repository";
import { ProfileNewsHttpAdapter } from "../../adapters/profile/profile-news-http.adapter";
import { StorageService } from "@api/storage/storage.service";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("ProfileNewsRepository", () => {
  let repository: ProfileNewsRepository;
  let adapter: jasmine.SpyObj<ProfileNewsHttpAdapter>;
  let storage: jasmine.SpyObj<StorageService>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProfileNewsHttpAdapter>("ProfileNewsHttpAdapter", [
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
        ProfileNewsRepository,
        { provide: ProfileNewsHttpAdapter, useValue: adapter },
        { provide: StorageService, useValue: storage },
      ],
    });
    repository = TestBed.inject(ProfileNewsRepository);
  }

  const page = (): ApiPagination<ProfileNews> => ({
    count: 1,
    next: "",
    previous: "",
    results: [{ id: 1 } as ProfileNews],
  });

  it("fetchNews делегирует в adapter со строковым userId и мапит results", done => {
    setup();
    adapter.fetchNews.and.returnValue(of(page()));

    repository.fetchNews(42).subscribe(res => {
      expect(adapter.fetchNews).toHaveBeenCalledOnceWith("42");
      expect(res.results[0]).toBeInstanceOf(ProfileNews);
      done();
    });
  });

  it("fetchNewsDetail мапит ответ в ProfileNews", done => {
    setup();
    adapter.fetchNewsDetail.and.returnValue(of({ id: 1 } as ProfileNews));

    repository.fetchNewsDetail("u1", "n1").subscribe(news => {
      expect(adapter.fetchNewsDetail).toHaveBeenCalledOnceWith("u1", "n1");
      expect(news).toBeInstanceOf(ProfileNews);
      done();
    });
  });

  it("addNews мапит ответ в ProfileNews", done => {
    setup();
    adapter.addNews.and.returnValue(of({ id: 1 } as ProfileNews));

    repository.addNews("u1", { text: "t", files: [] }).subscribe(news => {
      expect(adapter.addNews).toHaveBeenCalledOnceWith("u1", { text: "t", files: [] });
      expect(news).toBeInstanceOf(ProfileNews);
      done();
    });
  });

  it("readNews отмечает только ещё непрочитанные новости", done => {
    setup();
    storage.getItem.and.returnValue([1]);
    adapter.setNewsViewed.and.returnValue(of(undefined));

    repository.readNews(10, [1, 2, 3]).subscribe(() => {
      expect(adapter.setNewsViewed).toHaveBeenCalledTimes(2);
      expect(adapter.setNewsViewed).toHaveBeenCalledWith(10, 2);
      expect(adapter.setNewsViewed).toHaveBeenCalledWith(10, 3);
      expect(storage.setItem).toHaveBeenCalled();
      done();
    });
  });

  it("readNews возвращает пустой массив, если все уже прочитаны", done => {
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
    repository.delete("u1", 5).subscribe();
    expect(adapter.deleteNews).toHaveBeenCalledOnceWith("u1", 5);
  });

  it("toggleLike делегирует в adapter", () => {
    setup();
    adapter.toggleLike.and.returnValue(of(undefined));
    repository.toggleLike("u1", 5, true).subscribe();
    expect(adapter.toggleLike).toHaveBeenCalledOnceWith("u1", 5, true);
  });

  it("editNews мапит ответ в ProfileNews", done => {
    setup();
    adapter.editNews.and.returnValue(of({ id: 5 } as ProfileNews));

    repository.editNews("u1", 5, { text: "t" }).subscribe(news => {
      expect(adapter.editNews).toHaveBeenCalledOnceWith("u1", 5, { text: "t" });
      expect(news).toBeInstanceOf(ProfileNews);
      done();
    });
  });
});
