/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FeedFilterComponent } from "./feed-filter.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { FeedUIInfoService } from "@api/feed/facades/ui/feed-ui-info.service";

describe("FeedComponent", () => {
  let component: FeedFilterComponent;
  let fixture: ComponentFixture<FeedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedFilterComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [FeedUIInfoService],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedFilterComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("показывает шесть категорий в новом порядке с отдельными счетчиками", () => {
    TestBed.inject(FeedUIInfoService).categoryCounts.set({
      allNews: 6,
      projectNews: 2,
      newProject: 5,
      vacancy: 3,
      news: 4,
      partnerprogram: 0,
    });
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll(".desktop .filter__option"),
    ) as HTMLElement[];
    expect(
      options.map(option => option.querySelector(".filter__title")?.textContent?.trim()),
    ).toEqual([
      "все новости",
      "новости проектов",
      "новости сообщества",
      "свежие вакансии",
      "новые проекты",
      "новости программ",
    ]);
    expect(
      options.map(option => option.querySelector(".filter__count")?.textContent?.trim()),
    ).toEqual(["6", "2", "4", "3", "5", "0"]);
    for (const option of options) {
      expect(option.tagName).toBe("BUTTON");
      expect(Array.from(option.children).map(child => child.className)).toEqual([
        "filter__option--icon",
        "filter__title",
        "filter__count",
      ]);
      expect(option.querySelector(".filter__option--icon")?.getAttribute("aria-hidden")).toBe(
        "true",
      );
    }
    expect((options[4] as HTMLButtonElement).disabled).toBe(false);
    expect(options[0].getAttribute("aria-pressed")).toBe("true");
    const setFilter = vi.spyOn(component, "setFilter");
    options[4].click();
    expect(setFilter).toHaveBeenCalledExactlyOnceWith("new_project");
  });
});
