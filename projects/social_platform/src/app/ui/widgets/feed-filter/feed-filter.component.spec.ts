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

  it("показывает счётчики всех шести категорий независимо от фильтра", () => {
    TestBed.inject(FeedUIInfoService).categoryCounts.set({
      all: 12,
      project: 5,
      vacancy: 3,
      news: 4,
      partnerprogram: 0,
      education: 0,
    });
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll(".desktop .filter__option"),
    ) as HTMLElement[];
    expect(options).toHaveLength(6);
    expect(
      options.map(option => option.querySelector(".filter__count")?.textContent?.trim()),
    ).toEqual(["12", "5", "3", "4", "0", "0"]);
  });
});
