/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Params, RouterLink } from "@angular/router";
import {
  concatMap,
  distinctUntilChanged,
  fromEvent,
  map,
  noop,
  Observable,
  of,
  Subscription,
  tap,
  throttleTime,
} from "rxjs";
import { Program } from "@office/program/models/program.model";
import { User } from "@auth/models/user.model";
import { ProgramService } from "@office/program/services/program.service";
import { MemberCardComponent } from "@office/shared/member-card/member-card.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ApiPagination } from "@models/api-pagination.model";
import { ProjectCardComponent } from "@office/shared/project-card/project-card.component";
import { ProjectsFilterComponent } from "@office/projects/projects-filter/projects-filter.component";
import { SearchComponent } from "@ui/components/search/search.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import Fuse from "fuse.js";

/**
 * Компонент списка участников программы
 *
 * Отображает всех участников программы с поддержкой:
 * - Бесконечной прокрутки для подгрузки участников
 * - Адаптивного дизайна
 * - Интеграции с заголовком программы
 *
 * Принимает:
 * @param {ActivatedRoute} route - Для получения данных из резолвера
 * @param {ChangeDetectorRef} cdref - Для ручного обновления представления
 * @param {ProgramService} programService - Сервис для загрузки участников
 *
 * Данные:
 * @property {User[]} members - Массив участников программы
 * @property {number} membersTotalCount - Общее количество участников
 * @property {Observable<Program>} program$ - Поток данных программы
 * @property {Observable<User[]>} members$ - Поток участников из резолвера
 *
 * Пагинация:
 * @property {number} membersPage - Текущая страница
 * @property {number} membersTake - Количество участников на странице (20)
 *
 * ViewChild:
 * @ViewChild membersRoot - Ссылка на DOM элемент списка участников
 *
 * Жизненный цикл:
 * - OnInit: Загружает начальные данные из резолвера
 * - AfterViewInit: Настраивает обработчик прокрутки
 *
 * Методы:
 * @method onScroll() - Проверяет необходимость подгрузки данных
 * @method onFetch() - Загружает следующую порцию участников
 *
 * Возвращает:
 * HTML шаблон со списком карточек участников
 */
@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrl: "./members.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    MemberCardComponent,
    ProjectsFilterComponent,
    SearchComponent,
  ],
})
export class ProgramMembersComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly cdref: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly renderer: Renderer2,
    private readonly programService: ProgramService
  ) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  searchForm: FormGroup;

  members: User[] = [];
  searchedMembers: User[] = [];

  membersTotalCount?: number;
  membersPage = 1;
  membersTake = 20;

  subscriptions$: Subscription[] = [];
  private previousReqQuery: Record<string, any> = {};

  @ViewChild("membersRoot") membersRoot?: ElementRef<HTMLUListElement>;
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe((members: ApiPagination<User>) => {
      this.membersTotalCount = members.count;
      this.members = members.results;
      this.searchedMembers = members.results;
    });

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const fuse = new Fuse(this.members, {
        keys: ["name"],
      });

      this.searchedMembers = search ? fuse.search(search).map(el => el.item) : this.members;
    });

    querySearch$ && this.subscriptions$.push(querySearch$);
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target)
      fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  onScroll() {
    if (this.membersTotalCount && this.members.length >= this.membersTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.membersRoot) return of({});

    const diff =
      target.scrollTop -
      this.membersRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      return this.onFetch();
    }

    return of({});
  }

  onFetch() {
    return this.programService
      .getAllMembers(
        this.route.parent?.snapshot.params["programId"],
        this.membersPage * this.membersTake,
        this.membersTake
      )
      .pipe(
        tap((members: ApiPagination<User>) => {
          this.membersTotalCount = members.count;
          this.members = [...this.members, ...members.results];

          this.membersPage++;

          this.cdref.detectChanges();
        })
      );
  }

  isFilterOpen = false;

  private swipeStartY = 0;
  private swipeThreshold = 50;
  private isSwiping = false;

  onSwipeStart(event: TouchEvent): void {
    this.swipeStartY = event.touches[0].clientY;
    this.isSwiping = true;
  }

  onSwipeMove(event: TouchEvent): void {
    if (!this.isSwiping) return;

    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.swipeStartY;

    const progress = Math.min(deltaY / this.swipeThreshold, 1);
    this.renderer.setStyle(
      this.filterBody.nativeElement,
      "transform",
      `translateY(${progress * 100}px)`
    );
  }

  onSwipeEnd(event: TouchEvent): void {
    if (!this.isSwiping) return;

    const endY = event.changedTouches[0].clientY;
    const deltaY = endY - this.swipeStartY;

    if (deltaY > this.swipeThreshold) {
      this.closeFilter();
    }

    this.isSwiping = false;

    this.renderer.setStyle(this.filterBody.nativeElement, "transform", "translateY(0)");
  }

  closeFilter(): void {
    this.isFilterOpen = false;
  }
}
