/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewsFormComponent } from "./news-form.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ProjectNewsRepository as ProjectNewsService } from "@infrastructure/repository/project/project-news.repository";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { API_URL } from "@corelib";

describe("NewsFormComponent", () => {
  let component: NewsFormComponent;
  let fixture: ComponentFixture<NewsFormComponent>;

  beforeEach(async () => {
    const projectNewsServiceSpy = { addNews: vi.fn() };
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NewsFormComponent,
      ],
      providers: [
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
        { provide: AuthRepository, useValue: authSpy },
        { provide: API_URL, useValue: "" },
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
