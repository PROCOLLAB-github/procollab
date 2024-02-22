/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramNewsCardComponent } from "./news-card.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { AuthService } from "@auth/services";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DayjsPipe } from "@core/pipes/dayjs.pipe";
import { FeedNews } from "@office/projects/models/project-news.model";

describe("NewsCardComponent", () => {
  let component: ProgramNewsCardComponent;
  let fixture: ComponentFixture<ProgramNewsCardComponent>;

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
        ProgramNewsCardComponent,
        DayjsPipe,
      ],
      providers: [
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramNewsCardComponent);
    component = fixture.componentInstance;
    component.newsItem = FeedNews.default();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
