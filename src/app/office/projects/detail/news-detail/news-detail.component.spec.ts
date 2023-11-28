/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewsDetailComponent } from "./news-detail.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("NewsDetailComponent", () => {
  let component: NewsDetailComponent;
  let fixture: ComponentFixture<NewsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, NewsDetailComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
