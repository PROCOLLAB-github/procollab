/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileNewsComponent } from "./profile-news.component";
import { provideRouter } from "@angular/router";

describe("ProfileNewsComponent", () => {
  let component: ProfileNewsComponent;
  let fixture: ComponentFixture<ProfileNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileNewsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileNewsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
