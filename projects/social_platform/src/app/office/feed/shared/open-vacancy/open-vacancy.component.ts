/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/components/tag/tag.component";
import { Vacancy } from "@models/vacancy.model";
import { expandElement } from "@utils/expand-element";

@Component({
  selector: "app-open-vacancy",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    RouterLink,
    TagComponent,
    DayjsPipe,
    ParseLinksPipe,
    ParseBreaksPipe,
  ],
  templateUrl: "./open-vacancy.component.html",
  styleUrl: "./open-vacancy.component.scss",
})
export class OpenVacancyComponent implements AfterViewInit {
  @Input() feedItem!: Vacancy;
  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  constructor(public readonly router: Router, private readonly cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    const skillsElement = this.skillsEl?.nativeElement;
    this.skillsExpandable = skillsElement?.clientHeight < skillsElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  descriptionExpandable!: boolean;
  skillsExpandable!: boolean;

  readFullDescription = false;
  readFullSkills = false;

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullSkills = !isExpanded;
  }
}
