/** @format */
import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, of, startWith, Subject, switchMap, timer } from "rxjs";
import { GetMembersUseCase } from "@api/member/use-cases/get-members.use-case";
import { normalizeInviteText } from "@domain/invite/project-role-suggestions";
import { User } from "@domain/auth/user.model";

export interface InviteSearchState {
  status: "initial" | "loading" | "success" | "error";
  users: User[];
}

/** Состояние принадлежит открытому окну и не затрагивает каталог участников. */
@Injectable()
export class InviteParticipantSearchFacade {
  private readonly getMembers = inject(GetMembersUseCase);
  private readonly queries = new Subject<{ query: string; programId: number | null }>();
  readonly state = signal<InviteSearchState>({ status: "initial", users: [] });

  constructor() {
    this.queries
      .pipe(
        distinctUntilChanged((a, b) => a.query === b.query && a.programId === b.programId),
        // Внешний switchMap отменяет старый запрос сразу, ещё до debounce нового.
        switchMap(({ query, programId }) => {
          if (query.length < 2) return of<InviteSearchState>({ status: "initial", users: [] });
          const params: Record<string, string | number> = { fullname: query };
          if (programId !== null) params["partner_program"] = programId;
          // user_type=1 уже задаётся существующим MemberHttpAdapter.
          return timer(300).pipe(
            switchMap(() => this.getMembers.execute(0, 8, params)),
            map(
              result =>
                ({
                  status: result.ok ? "success" : "error",
                  users: result.ok ? result.value.results : [],
                }) as InviteSearchState,
            ),
            startWith<InviteSearchState>({ status: "loading", users: [] }),
          );
        }),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(state => this.state.set(state));
  }

  search(query: string, programId: number | null): void {
    this.queries.next({ query: normalizeInviteText(query), programId });
  }
}
