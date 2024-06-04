/** @format */

import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../shared/circle-progress-bar/circle-progress-bar.component";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { TaskResults } from "../../../models/skill.model";

@Component({
  selector: "app-complete",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent, IconComponent, ButtonComponent],
  templateUrl: "./complete.component.html",
  styleUrl: "./complete.component.scss",
})
export class TaskCompleteComponent implements OnInit {
  @Input() results!: TaskResults;

  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit(): void {
    this.route.data.subscribe(r => this.results = r['data'])
  }
}
