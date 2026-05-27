/** @format */
import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { expandElement } from "@utils/expand-element";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { AppRoutes } from "@api/paths/app-routes";

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
})
export class ProjectVacancyCardComponent implements OnInit, AfterViewInit {
  protected readonly AppRoutes = AppRoutes;
  @Input({ required: true }) vacancy!: Vacancy;
  @Input() type: "vacancies" | "project" = "project";

  @ViewChild("descEl") descEl?: ElementRef;

  private readonly cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.endSliceOfSkills = this.type === "project" ? 5 : 3;
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  descriptionExpandable!: boolean;
  readFullDescription = false;
  endSliceOfSkills = 0;

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
