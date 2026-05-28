/** @format */
import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/primitives";
import { DayjsPipe, ParseBreaksPipe, ParseLinksPipe, TruncatePipe } from "@corelib";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { AppRoutes } from "@api/paths/app-routes";
import { ExpandService } from "@api/expand/expand.service";

/** Компонент карточки вакансии проекта с возможностью раскрытия описания. */
@Component({
  selector: "app-project-vacancy-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    ButtonComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    TruncatePipe,
    TagComponent,
    AvatarComponent,
    DayjsPipe,
  ],
  templateUrl: "./project-vacancy-card.component.html",
  styleUrl: "./project-vacancy-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExpandService],
})
export class ProjectVacancyCardComponent implements OnInit, AfterViewInit {
  private readonly expandService = inject(ExpandService);

  protected readonly AppRoutes = AppRoutes;
  @Input({ required: true }) vacancy!: Vacancy;
  @Input() type: "vacancies" | "project" = "project";

  @ViewChild("descEl") private descEl?: ElementRef;

  endSliceOfSkills = 0;

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

  ngOnInit(): void {
    this.endSliceOfSkills = this.type === "project" ? 5 : 3;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.expandService.checkExpandable("description", true, this.descEl);
    });
  }

  protected onExpandDescription(elem: HTMLElement): void {
    this.expandService.onExpand(
      "description",
      elem,
      "expanded",
      this.expandService.readFullDescription()
    );
  }
}
