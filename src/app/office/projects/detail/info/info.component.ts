/** @format */

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { Project } from "@models/project.model";
import { IndustryService } from "@services/industry.service";
import { NavService } from "@services/nav.service";
import { Vacancy } from "@models/vacancy.model";
import { AuthService } from "@auth/services";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ProjectNews } from "@office/projects/models/project-news.model";
import { containerSm } from "@utils/responsive";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.scss"],
})
export class ProjectInfoComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    public readonly industryService: IndustryService,
    public readonly authService: AuthService,
    private readonly navService: NavService,
    private readonly projectNewsService: ProjectNewsService,
    private readonly fb: FormBuilder
  ) {
    this.newsForm = this.fb.group({
      text: ["", [Validators.required]],
    });
  }

  project$?: Observable<Project> = this.route.parent?.data.pipe(map(r => r["data"]));

  vacancies$: Observable<Vacancy[]> = this.route.data.pipe(map(r => r["data"]));

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль проекта");

    this.projectNewsService.fetchNews(this.route.snapshot.params.projectId).subscribe(news => {
      this.news = news;
    });
  }

  @ViewChild("newsEl") newsEl?: ElementRef;
  @ViewChild("contentEl") contentEl?: ElementRef;
  ngAfterViewInit(): void {
    if (containerSm < window.innerWidth) {
      this.contentEl?.nativeElement.append(this.newsEl?.nativeElement);
    }
  }

  news: ProjectNews[] = [];

  readFull = false;

  newsForm: FormGroup;

  onAddNews(news: ProjectNews): void {
    this.news.unshift(news);
  }

  onDeleteNews(newsId: number): void {
    const newsIdx = this.news.findIndex(n => n.id === newsId);
    this.news.splice(newsIdx, 1);

    this.projectNewsService
      .delete(this.route.snapshot.params.projectId, newsId)
      .subscribe(() => {});
  }
}
