/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewsAllComponent } from "./all.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

describe("NewsAllComponent", () => {
  let component: NewsAllComponent;
  let fixture: ComponentFixture<NewsAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [NewsAllComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
