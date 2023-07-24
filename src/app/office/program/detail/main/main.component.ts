/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ActivatedRoute } from "@angular/router";
import { concatMap, map, Observable, of, Subscription, tap } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramNewsService } from "@office/program/services/program-news.service";
import { ProjectNews, ProjectNewsRes } from "@office/projects/models/project-news.model";
import { AngularNgNewOptionsSchema } from "@angular/cli/lib/config/workspace-schema";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class ProgramDetailMainComponent implements OnInit, OnDestroy {
  constructor(
    private readonly programService: ProgramService,
    private readonly programNewsService: ProgramNewsService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const program$ = this.programService
      .getOne(this.route.parent?.snapshot.params.programId)
      .pipe(
        tap(program => {
          this.program = program;
        }),
        concatMap(program => {
          if (program.isUserMember) {
            return this.programNewsService.fetchNews(program.id);
          } else {
            return of({} as ProjectNewsRes);
          }
        })
      )
      .subscribe(news => {
        if (news.results?.length) {
          this.news = news.results;
        }
      });

    this.subscriptions$.push(program$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];
  news: ProjectNews[] = [];
  program?: Program;
  // program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

  readFullDescription = false;
}
