/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.scss"],
})
export class ProgramMembersComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {}

  program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));
  members$: Observable<User[]> = this.route.data.pipe(
    map(r => r["data"]),
    map(r => r["results"])
  );
}
