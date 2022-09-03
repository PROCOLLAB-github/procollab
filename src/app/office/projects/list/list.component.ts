/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { pluck } from "rxjs";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ProjectsListComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  projects$ = this.route.data.pipe(pluck("data"));

  ngOnInit(): void {}
}
