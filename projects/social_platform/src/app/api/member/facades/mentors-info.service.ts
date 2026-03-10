/** @format */

import { ElementRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import {
  concatMap,
  EMPTY,
  fromEvent,
  map,
  Subject,
  take,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { MemberHttpAdapter } from "projects/social_platform/src/app/infrastructure/adapters/member/member-http.adapter";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { User } from "../../../domain/auth/user.model";
import { MentorsUIInfoService } from "./ui/mentors-ui-info.service";

@Injectable()
export class MentorsInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly navService = inject(NavService);
  private readonly memberService = inject(MemberHttpAdapter);
  private readonly mentorsUIInfoService = inject(MentorsUIInfoService);

  private readonly destroy$ = new Subject<void>();

  /**
   * Инициализация страницы менторов:
   * - Устанавливает заголовок навигации
   * - Загружает начальные данные из резолвера
   */
  initializationMentors(): void {
    this.navService.setNavTitle("Наставники");

    this.route.data
      .pipe(
        take(1),
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe((mentors: ApiPagination<User>) => {
        this.mentorsUIInfoService.applyMentorsPagination(mentors);
      });
  }

  /**
   * Инициализация бесконечного скролла
   *
   * @param target - элемент, на котором слушается событие скролла
   * @param membersRoot - корневой элемент списка для расчёта позиции
   */
  initScroll(target: HTMLElement, membersRoot: ElementRef<HTMLUListElement>): void {
    fromEvent(target, "scroll")
      .pipe(
        throttleTime(500),
        concatMap(() => this.onScroll(target, membersRoot)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private onScroll(target: HTMLElement, membersRoot: ElementRef<HTMLUListElement>) {
    const total = this.mentorsUIInfoService.mentorsTotalCount();

    if (total !== undefined && this.mentorsUIInfoService.members().length >= total) {
      return EMPTY;
    }

    if (!target || !membersRoot?.nativeElement) return EMPTY;

    const diff =
      target.scrollTop -
      membersRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      const skip = this.mentorsUIInfoService.members().length;
      const take = this.mentorsUIInfoService.mentorsTake();

      return this.memberService.getMentors(skip, take).pipe(
        tap(data => {
          this.mentorsUIInfoService.applyMentorsChunk(data);
        }),
        takeUntil(this.destroy$)
      );
    }

    return EMPTY;
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
