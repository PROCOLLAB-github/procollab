/** @format */

import { Component, Input, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, Observable } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramCardComponent } from "../../shared/program-card/program-card.component";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  imports: [RouterLink, ProgramCardComponent, AsyncPipe],
})
export class ProgramMainComponent implements OnInit {
  @Input() programs$!: Observable<Program[]>;
  route = inject(ActivatedRoute)

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.programs$ = r["data"];
      this.programs$ = r['results'];
    })
  }
}
