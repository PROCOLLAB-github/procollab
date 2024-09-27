/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";
import { BarComponent } from "@ui/components";
import { SearchComponent } from "@ui/components/search/search.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-rate-projects",
  templateUrl: "./rate-projects.component.html",
  styleUrl: "./rate-projects.component.scss",
  standalone: true,
  imports: [RouterLinkActive, RouterLink, RouterOutlet, BackComponent, BarComponent, SearchComponent, ReactiveFormsModule],
})
export class RateProjectsComponent implements OnInit, OnDestroy {
  constructor(private readonly navService: NavService, private readonly router: Router, private readonly route: ActivatedRoute, private readonly fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  searchForm: FormGroup;
  subscriptions$: Subscription[] = [];
  programId?: number;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");

    this.programId = this.route.snapshot.params["programId"];

    const searchFormSearch$ = this.searchForm.get("search")?.valueChanges.subscribe(search => {
      this.router
        .navigate([], {
          queryParams: { search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from ProjectsComponent"));
    });

    searchFormSearch$ && this.subscriptions$.push(searchFormSearch$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }
}
