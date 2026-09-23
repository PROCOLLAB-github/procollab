/** @format */
import { FeedNews } from "@domain/news/project-news.model";
import { FeedItem } from "@domain/feed/feed-item.model";
import { FeedUIInfoService } from "./feed-ui-info.service";

describe("FeedUIInfoService: единый input карточки и окна", () => {
  it("лайк обновляет только нужную новость, сохраняя порядок, page size и counts", () => {
    const ui = new FeedUIInfoService();
    const results: FeedItem[] = [1, 2, 3, 4, 5, 6].map(id => ({
      typeModel: "news",
      content: { ...FeedNews.default(), id, isUserLiked: false, likesCount: 0 },
    }));
    const counts = { all: 86, project: 56, vacancy: 3, news: 27, partnerprogram: 0, education: 0 };
    ui.applyInitializationFeedNewsEvent({ count: 86, results, counts });
    ui.applyLikeNews(1);
    expect(ui.feedItems().map(item => item.content.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(ui.feedItems()[0]).toBe(results[0]);
    expect(ui.feedItems()[1].content).toMatchObject({ isUserLiked: true, likesCount: 1 });
    expect(ui.categoryCounts()).toBe(counts);
    expect(ui.perFetchTake()).toBe(6);
    expect(ui.feedPage()).toBe(6);
    ui.applyLikeNews(1);
    expect(ui.feedItems()[1].content).toMatchObject({ isUserLiked: false, likesCount: 0 });
  });
});
