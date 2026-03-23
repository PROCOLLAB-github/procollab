/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewsCardComponent } from "./news-card.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { ProjectNewsRepository as ProjectNewsService } from "projects/social_platform/src/app/infrastructure/repository/project/project-news.repository";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DayjsPipe } from "projects/core";
import { FeedNews } from "projects/social_platform/src/app/domain/project/project-news.model";

describe("NewsCardComponent", () => {
  let component: NewsCardComponent;
  let fixture: ComponentFixture<NewsCardComponent>;

  beforeEach(async () => {
    const projectNewsServiceSpy = jasmine.createSpyObj(["addNews"]);
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NewsCardComponent,
        DayjsPipe,
      ],
      providers: [
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
        { provide: AuthRepository, useValue: authSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsCardComponent);
    component = fixture.componentInstance;
    component.feedItem = FeedNews.default();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
