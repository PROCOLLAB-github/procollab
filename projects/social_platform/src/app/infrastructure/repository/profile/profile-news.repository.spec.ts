/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProfileNewsRepository } from "./profile-news.repository";
import { ProfileNewsHttpAdapter } from "../../adapters/profile/profile-news-http.adapter";
import { StorageService } from "@domain/shared/storage.service";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("ProfileNewsRepository", () => {
  let repository: ProfileNewsRepository;
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

  it("fetchNews делегирует в adapter со строковым userId и мапит results", () =>
    new Promise<void>(done => {
      setup();
      adapter.fetchNews.mockReturnValue(of(page()));

      repository.fetchNews("42").subscribe(res => {
        expect(adapter.fetchNews).toHaveBeenCalledExactlyOnceWith("42");
        expect(res.results[0]).toBeInstanceOf(ProfileNews);
        done();
      });
    }));

  it("fetchNewsDetail мапит ответ в ProfileNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.fetchNewsDetail.mockReturnValue(of({ id: 1 } as ProfileNews));

      repository.fetchNewsDetail("u1", "n1").subscribe(news => {
        expect(adapter.fetchNewsDetail).toHaveBeenCalledExactlyOnceWith("u1", "n1");
        expect(news).toBeInstanceOf(ProfileNews);
        done();
      });
    }));

  it("addNews мапит ответ в ProfileNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.addNews.mockReturnValue(of({ id: 1 } as ProfileNews));

      repository.addNews("u1", { text: "t", files: [] }).subscribe(news => {
        expect(adapter.addNews).toHaveBeenCalledExactlyOnceWith("u1", { text: "t", files: [] });
        expect(news).toBeInstanceOf(ProfileNews);
        done();
      });
    }));

  it("readNews отмечает только ещё непрочитанные новости", () =>
    new Promise<void>(done => {
      setup();
      storage.getItem.mockReturnValue([1]);
      adapter.setNewsViewed.mockReturnValue(of(undefined));

      repository.readNews(10, [1, 2, 3]).subscribe(() => {
        expect(adapter.setNewsViewed).toHaveBeenCalledTimes(2);
        expect(adapter.setNewsViewed).toHaveBeenCalledWith(10, 2);
        expect(adapter.setNewsViewed).toHaveBeenCalledWith(10, 3);
        expect(storage.setItem).toHaveBeenCalled();
        done();
      });
    }));

  it("readNews возвращает пустой массив, если все уже прочитаны", () =>
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
    repository.delete("u1", 5).subscribe();
    expect(adapter.deleteNews).toHaveBeenCalledExactlyOnceWith("u1", 5);
  });

  it("toggleLike делегирует в adapter", () => {
    setup();
    adapter.toggleLike.mockReturnValue(of(undefined));
    repository.toggleLike("u1", 5, true).subscribe();
    expect(adapter.toggleLike).toHaveBeenCalledExactlyOnceWith("u1", 5, true);
  });

  it("editNews мапит ответ в ProfileNews", () =>
    new Promise<void>(done => {
      setup();
      adapter.editNews.mockReturnValue(of({ id: 5 } as ProfileNews));

      repository.editNews("u1", 5, { text: "t" }).subscribe(news => {
        expect(adapter.editNews).toHaveBeenCalledExactlyOnceWith("u1", 5, { text: "t" });
        expect(news).toBeInstanceOf(ProfileNews);
        done();
      });
    }));
});
