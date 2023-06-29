/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewsFormComponent } from "./news-form.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";

describe("NewsFormComponent", () => {
  let component: NewsFormComponent;
  let fixture: ComponentFixture<NewsFormComponent>;

  beforeEach(async () => {
    const projectNewsServiceSpy = jasmine.createSpyObj(["addNews"]);
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      declarations: [NewsFormComponent],
      imports: [RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
