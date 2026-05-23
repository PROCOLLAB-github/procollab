<!-- @format -->

# Оптимизация сетевых запросов и архитектуры shell-state

## Контекст замеров

Замеры сделаны **через hard reload каждой страницы** (URL bar, не SPA-навигация). Это критически важная оговорка:

- Все запросы, которые стреляют «на каждой странице» в `OfficeComponent` (`industries/`, `programs/`, `chats/has-unreads/`, `users/types/`, `users/roles/`, `users/current/`) при SPA-навигации внутри `/office/*` фактически выполняются **один раз за сессию** (пока `OfficeComponent` жив).
- При hard reload они стартуют с нуля — это нормальное поведение Angular bootstrap, не баг.
- Поэтому часть «дублей» — это session-restart артефакт, а не runtime-проблема.

**Реальные проблемы, которые остаются и при SPA-навигации:**

1. `AuthRequiredGuard` зовёт `fetchProfile()` на КАЖДОЙ навигации в `/office`, не используя кеш.
2. Resolvers `OfficeResolver` + `ProjectsInvitesResolver` дублируют `invites/` запросом 2-3 раза на одну навигацию внутри `/office/projects/*`.
3. `DetailProfileInfoService.initializationLeaderProjects()` грузит `users/projects/leader/` на любом профиле, даже если UI этого не использует.
4. `ProjectInfoResolver` перезапускается на каждой навигации к `projects/:id/...`, нет кеша между переходами на один и тот же проект.
5. Reference-data (`users/types`, `users/roles`, `industries`) не persist'ятся между релоадами, хотя меняются крайне редко.
6. WS-подписки (`connectChatUseCase`, `observeSetOnline/Offline`) в `OfficeInfoService.initializationStatus()` потенциально не очищаются при пересоздании `OfficeComponent` — нужна проверка.

---

## Карта запросов и их источников

| Запрос                        | Триггер                                                                    | Файл / строка                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `auth/users/types/`           | `AppComponent.ngOnInit` → `forkJoin([fetchUserRoles])`                     | `app.component.ts:55`                                                                                          |
| `auth/users/roles/`           | `AppComponent.ngOnInit` → `forkJoin([fetchChangeableRoles])`               | `app.component.ts:55`                                                                                          |
| `auth/users/current/`         | `AuthRequiredGuard` → `authRepository.fetchProfile()`                      | `core/src/lib/guards/auth/auth-required.guard.ts:30`                                                           |
| `industries/`                 | `OfficeInfoService.initializationOffice()` → `industryRepository.getAll()` | `office-info.service.ts:48`                                                                                    |
| `programs/`                   | `OfficeComponent.ngOnInit` → `getActualProgramsUseCase`                    | `office.component.ts:100`                                                                                      |
| `chats/has-unreads/`          | `OfficeInfoService.initializationOffice()` → `checkUnreadsUseCase`         | `office-info.service.ts:57`                                                                                    |
| `invites/` (1)                | `OfficeResolver`                                                           | `ui/pages/office/office.resolver.ts`                                                                           |
| `invites/` (2)                | `ProjectsInvitesResolver` (parent route)                                   | `ui/routes/projects/projects.routes.ts:44`                                                                     |
| `invites/` (3)                | `ProjectsInvitesResolver` (child route `invites`)                          | `ui/routes/projects/projects.routes.ts:77`                                                                     |
| `auth/users/projects/leader/` | `DetailProfileInfoService.initializationLeaderProjects()` безусловно       | `widgets/detail/services/profile/detail-profile-info.service.ts:60`, дёргается из `detail-info.service.ts:242` |
| `vacancies/?project_id=X`     | `ProjectInfoResolver` на каждой навигации                                  | `ui/pages/projects/detail/info/info.resolver.ts`                                                               |
| `projects/:id/news/`          | загрузка детали проекта (тот же контекст)                                  | детальная страница проекта                                                                                     |

---

## Архитектурный корневой диагноз

**Симптомы — следствие отсутствия слоя глобального состояния (shell state).**

Текущая модель данных:

- `Repository` хранит `ReplaySubject` (`AuthRepository`) или `signal` (`IndustryRepository`) — но геттеры `fetchProfile()` / `getAll()` **всегда** идут в HTTP. Кеш заполняется как побочный эффект (`tap(... → subject.next)`), но не используется для short-circuit-логики.
- `Resolver`'ы используются как «pull data перед рендером компонента», но не кешируют между навигациями и могут стоять на двух уровнях иерархии маршрутов (двойной запрос).
- `*-info.service.ts` — это микс UI-state и orchestration, без чёткой semantics «когда грузить».
- `AsyncState` из `domain/shared/async-state.ts` уже существует, но почти нигде не используется (только в новом `InviteInfoService`).

Из этого вытекают все 6 проблем выше. Решение — **единый Shell State Layer**, не точечные фиксы.

---

# Текущий статус (обновлено 2026-05-23)

## Дашборд стадий

| Stage | Что | Приоритет | Статус |
| --- | --- | --- | --- |
| 1 | Shell State Layer (5 state-сервисов) | Critical | ✅ Done |
| 2 | Удалить дублирующие резолверы `invites` | High | ✅ Done |
| 2.5 | `info-card`: убрать внутренний HTTP (двойной accept/reject) | High | ⬜ TODO ← **следующий** |
| 3 | WS-инициализация в отдельный сервис + WS-push для unread | High | ⬜ TODO |
| 4 | leader projects: условная lazy-загрузка | Medium | ✅ Done (в рамках 1.3) |
| 5 | Кеш detail-страниц проектов | Medium | ⬜ TODO |
| 6 | Persist reference data (localStorage) | Medium | ⬜ TODO |
| 7 | Нормализация query params | Low | ⬜ TODO |
| 8 | Дубль `specializations/nested` (debug) | Low | ⬜ TODO |

Отдельно: trailing-slash 301-фиксы по адаптерам — ✅ Done (закоммичено).

## Что сделано в Stage 1

5 state-сервисов (`providedIn: "root"`, единый контракт `AsyncState` + `ensureLoaded/refresh/invalidate` + `inflight`-дедуп):

| Сервис | Файл | Триггер | invalidate в logout |
| --- | --- | --- | --- |
| `InviteInfoService` | `api/invite/facades/invite-info.service.ts` | office-init | ✅ |
| `ProfileInfoService` | `api/profile/facades/profile-info.service.ts` | office-init | ✅ |
| `IndustryStateInfoService` | `api/industry/facades/industry-state-info.service.ts` | office-init | (опц., справочник) |
| `ProgramShellInfoService` | `api/program/facades/program-shell-info.service.ts` | office.component | ❌ (D2) |
| `ChatUnreadStateService` | `api/chat/chat-unread-state.service.ts` | office-init | ✅ |

**Старое убрано:** `OfficeResolver`, `ProjectsInvitesResolver`, прямые `getAll`/`fetch*`/`checkUnreads`-триггеры, `ChatStateService.unread$`, `AppComponent.forkJoin(roles)`, фасад `IndustryInfoService` (схлопнут в state).

## Реестр технического долга

Чинить **отдельным cleanup-проходом ПОСЛЕ фич-стадий** (долг ничего не ломает). Исключение — если долг блокирует следующую стадию; сейчас таких нет.

| ID | Долг | Приоритет | Статус |
| --- | --- | --- | --- |
| D1 | Profile: мигрировать ~25 читателей `authRepository.profile` на сигнал `profileInfoService.profile()`, затем снести switchAll-мост (Шаг 1.3.1) | Medium | ⬜ отложено (вместе со Stage 6) |
| D2 | `ProgramShellInfoService.invalidate()` в logout | Low | ✅ сделано (`office.component.onLogout`) |
| D3 | `next: (result: any)` в invite/industry/chatUnread/program — типизировать | Low | ✅ сделано (subscribe на типизированный `request$`) |
| D4 | `AppComponent` — неиспользуемый импорт `forkJoin` | Low | ✅ сделано |
| D5 | `registeredProgramEffect` — возможный lint «unused field» (нормальный паттерн для `effect`) | Trivial | ⬜ по факту (если lint ругнётся) |

Дополнительно сделано в cleanup-проходе: убраны мёртвые импорты `Accept/RejectInviteUseCase` в `info-card`, `share` в `invite-info`; фикс маппинга `invite.sender`/`invite.user` через `userFromRaw` в `InviteRepository.getMy()` (плоский sender с бэка → `personal.avatar`).

## Рекомендуемый следующий шаг

**Stage 2.5** (`info-card`) — короткий, закрывает давний баг двойного accept/reject. Затем **Stage 3** (WS), затем **Stage 5** (project detail cache).

---

# Roadmap

## Stage 1 — Shell State Layer (P0, Critical) — ✅ DONE

### Problem

Нет общего слоя кеша/state для «shell data» (профиль, roles, types, industries, programs, invites, unreads). Каждый компонент/гард/резолвер сам решает «грузить или нет», без скоординированности.

### Root Cause

Repository-слой реализует только «всегда фетчить + положить в subject»; нет «load-if-missing» семантики. AsyncState определён, но не применён как pattern.

### Why It Matters

- Любой новый dev не понимает, нужно ли ему грузить industries — нет единой точки входа.
- State раздублирован: invites лежит в `OfficeInfoService.invites`, `OfficeUIInfoService.applySetInvites`, `InviteInfoService.invites$`, в трёх resolver'ах.
- Невозможно сделать осмысленный кеш P5 (project detail) без существующего паттерна.

### Priority

**Critical**

### Impact

arch / perf / maintainability / DX

### Plan

#### Шаг 1.1 — Определить контракт state-сервиса

Сформулировать единый контракт, который все state-сервисы будут реализовывать. Цель — единообразный mental model.

Минимальный публичный API (без реализации, как ориентир):

```ts
class XStateService {
  // Read-only:
  readonly state: Signal<AsyncState<T>>; // raw state
  readonly data: Signal<T | null>; // computed: success.data | loading.previous | null
  readonly isLoading: Signal<boolean>;
  readonly isError: Signal<boolean>;

  // Lifecycle:
  ensureLoaded(): void; // идемпотентный; ничего не делает в loading|success
  refresh(): void; // force reload, переход в loading с previous
  invalidate(): void; // сброс в initial (на logout / смена юзера)

  // Domain mutations (для каждого сервиса свои):
  // ...
}
```

`providedIn: "root"`, без `Subject<destroy>` (root-сервисы живут всю сессию).

#### Шаг 1.2 — Реализовать `InviteStateService` как pilot

Это уже частично сделано в `api/invite/invite-info.service.ts` — нужно довести до референса.

Корректировки относительно текущего `InviteInfoService`:

1. **Убрать зависимость от `ActivatedRoute`.** Сейчас `loadInvites()` подписывается на `route.data` и читает `r["invites"]`. Это привязка к маршрутизации и не решает проблему дублирующих резолверов. Сервис должен сам звать `GetMyInvitesUseCase.execute()`.

2. **Убрать `loaded` и `loading` сигналы.** Они дублируют состояния `AsyncState`. `isLoading(state)` / `isSuccess(state)` уже есть в `domain/shared/async-state.ts`. Два источника правды внутри одного сервиса — антипаттерн.

3. **Убрать `destroy$ = new Subject<void>()`.** Сервис `providedIn: "root"` живёт всю сессию — `takeUntil(destroy$)` никогда не сработает. Если нужна отписка use-case'ов — использовать `takeUntilDestroyed(destroyRef)` где нужно, или вообще не делать ничего (root сам отвалится при app teardown).

4. **`ensureLoaded()` контракт:**

   - В `loading` или `success` — no-op.
   - В `initial` или `failure` — стартует фетч, переводит в `loading(previous=undefined)` или `loading(previous=lastSuccess)`.

5. **Domain actions (`onAcceptInvite`, `onRejectInvite`)** оставить здесь, но логику навигации (`router.navigateByUrl(...)`) **вынести наружу**. State-сервис не должен знать о роутах. Это side-effect, который делает компонент / orchestrator.

6. **Переименовать в `InviteStateService`** для консистентности (а не `InviteInfoService`).

#### Шаг 1.3 — `ProfileStateService`

Объединяет:

- `User profile` (`auth/users/current/`)
- `roles` (`auth/users/types/`)
- `changeableRoles` (`auth/users/roles/`)
- `leaderProjects` (`auth/users/projects/leader/`) — **lazy computed**, не грузится автоматически (см. Stage 4)

Особенности:

- `ensureLoaded()` грузит profile + roles + changeableRoles параллельно (`forkJoin`).
- `leaderProjects` — отдельный `ensureLeaderProjectsLoaded()`, который дергается только из UI, который реально показывает кнопку invite.
- На `logout()` — вызвать `invalidate()` всех state-сервисов.

**Статус реализации:** сделано как `ProfileInfoService` (`api/profile/facades/profile-info.service.ts`). Подключено через:

- `office-info.service.ts` — `ensureProfileLoaded()` в init; `invalidateProfile()` + `invalidateLeaderProjects()` в `onLogout`.
- `detail-profile-info.service.ts` — `initializationLeaderProjects()` реактивно (ждёт профиль через `toObservable + filter + take(1)`), грузит leader только для чужого профиля (`viewedId !== currentUser.id`). Вызывается из `detail-info.service.ts` (profile-ветка `initializeInfo`).
- Гард `AuthRequiredGuard` остался в `core/` и зовёт `authRepository.fetchProfile()` — вариант **A** (cache-aware fetch в репозитории), т.к. core не может импортировать `ProfileInfoService` из `social_platform`.

#### Шаг 1.3.1 — ВРЕМЕННЫЙ мост в `AuthRepository` (на снос)

Чтобы профиль/роли можно было сбросить на logout, не сломав ~25 потребителей `authRepository.profile` (Observable), в репозиторий введён switchAll-store:

```ts
private profileSubject = new ReplaySubject<User>(1);                              // значение
private profileStore$ = new BehaviorSubject<ReplaySubject<User>>(profileSubject); // активный subject
profile = this.profileStore$.pipe(switchAll());                                   // стабильная внешняя ссылка
// resetProfileCache(): подменяет profileSubject на новый + profileLoaded = false
```

Плюс флаг `profileLoaded` для cache-aware `fetchProfile` (вариант A — чинит рефетч профиля гардом на каждой навигации).

**Это технический долг переходного периода, а не целевая архитектура.** Три слоя (`ReplaySubject` + `BehaviorSubject` + `switchAll`) существуют ТОЛЬКО потому, что ReplaySubject нельзя очистить, а ~25 мест держат захваченную ссылку на `authRepository.profile`.

**Условие удаления:** когда все читатели `authRepository.profile` / `.roles` / `.changeableRoles` мигрируют на `profileInfoService.profile()` / `.roles()` / `.changeableRoles()` (сигналы) — удалить из `AuthRepository`:

- `profileSubject` / `profileStore$` / `switchAll` (и аналоги для roles/changeableRoles)
- `profileLoaded` флаг
- `resetProfileCache()` (+ из порта `AuthRepositoryPort`)
- сам стрим `profile` / `roles` / `changeableRoles`

После этого `invalidate()` в `ProfileInfoService` станет одной строкой `this.profile$.set(initial())` — без всякой машинерии. Список читателей под миграцию см. `grep "authRepository.profile" --include=*.ts` (~25 мест, преимущественно компонентные подписки через `takeUntil`).

#### Шаг 1.4 — `IndustryStateService`

Тонкая обёртка вокруг `IndustryRepository.getAll()` с idempotent `ensureLoaded`.
`getOne(id)` остаётся в репозитории — это просто find по signal-кешу, синхронный.

#### Шаг 1.5 — `ProgramShellStateService`

Только для тех 3 актуальных программ, которые рендерятся в sidebar (логика из `OfficeComponent.ngOnInit`, `office.component.ts:100-117`). Не путать с детальной страницей программы.

#### Шаг 1.6 — `ChatUnreadStateService`

- `ensureLoaded()` — однократный `checkUnreadsUseCase`.
- Plus WS-подписка на push-обновления (см. Stage 3, инициализация WS).
- На переходе в `/chats` — `setUnread(false)` локально, без HTTP.

### Validation

- Все 5 новых сервисов имеют один и тот же контракт (статическая проверка через TypeScript-интерфейс `StateService<T>` опционально).
- Покрытие unit-тестами: `ensureLoaded` идемпотентен (вызов 2 раза = 1 HTTP), `refresh` всегда фетчит, `invalidate` сбрасывает в `initial`.
- Mental model простой: «нужен X в UI → `inject(XStateService); xState.ensureLoaded(); read xState.data()`».

### Possible Hidden Issues

- **AsyncState `loading(previous)` под `OnPush`**: текущий компонент может не перерисоваться, потому что объект `{status, previous}` всё равно новый. Это OK с signal, но если миксуется с `Observable` + `async pipe` — проверь.
- **Гонка между `ensureLoaded` и `refresh`**: если `refresh` стартует когда `ensureLoaded` ещё в `loading` — нужна семантика (cancel previous? игнор?). Договориться: `refresh` отменяет текущий fetch через abort/cancellation, либо просто берёт «последний выигрывает».
- **Дедупликация in-flight запросов**: если два компонента одновременно зовут `ensureLoaded()` в `initial` — должен быть один HTTP, не два. Внутри ensureLoaded можно держать промежуточный `inflightObservable` (shareReplay-style).

---

## Stage 2 — Удалить дублирующие резолверы (P2, High) — ✅ DONE

### Problem

`invites/` грузится 2-3 раза на одну навигацию к `/office/projects/*`.

### Root Cause

- `OfficeResolver` зарегистрирован в `office.routes.ts:30` (parent `/office`).
- `ProjectsInvitesResolver` зарегистрирован в `projects.routes.ts:44` (parent `/office/projects`).
- Тот же `ProjectsInvitesResolver` зарегистрирован в `projects.routes.ts:77` (child `/office/projects/invites`).

Все три зовут `GetMyInvitesUseCase`.

### Why It Matters

3× избыточных HTTP на маршрут `/office/projects/invites`, 2× на `/office/projects/subscriptions`, `/office/projects/my`, `/office/projects/all`.

### Priority

**High** (но строго ПОСЛЕ Stage 1, иначе нечем заменить).

### Impact

perf / arch

### Plan

#### Шаг 2.1 — Удалить child-резолвер

В `projects.routes.ts:77` (child `invites`) убрать `resolve: { data: ProjectsInvitesResolver }`. Parent-уровень уже его делает. Компонент `ProjectsListComponent` для пути `invites` должен читать invites из `InviteStateService`, не из `route.data`.

#### Шаг 2.2 — Удалить parent-резолвер `ProjectsInvitesResolver` (строка 44)

После того как Stage 1 готов и `InviteStateService` зовётся из `OfficeComponent.ngOnInit()` (или из гарда). Файл `invites.resolver.ts` после удаления — снести.

#### Шаг 2.3 — Удалить `OfficeResolver`

Аналогично, после миграции на `InviteStateService.ensureLoaded()` в `OfficeComponent.ngOnInit()`. Файл `office.resolver.ts` снести.

#### Шаг 2.4 — Переписать чтение invites в компонентах

Поискать все `route.data["invites"]` и `route.data["data"]` (где это invites) — заменить на чтение из `InviteStateService.data()`.

### Validation

SPA-навигация `/office/feed → /office/projects/all → /office/projects/subscriptions → /office/projects/invites` — **ноль** запросов к `invites/` после первой загрузки (или максимум один, если триггерим `refresh` при заходе на страницу `invites`).

### Possible Hidden Issues

- `OfficeUIInfoService.applySetInvites` сейчас вызывается из `OfficeInfoService.initializationInvites()`. Если эту цепочку выпилить — проверь, что нет другого кода, который полагается на `applySetInvites` как entry point.

---

## Stage 2.5 — Рефакторинг `info-card`: убрать внутренний HTTP (P2, High) — ⬜ TODO (следующий)

### Problem

`InfoCardComponent` (`ui/widgets/info-card/info-card.component.ts:138-187`) делает HTTP-запросы accept/reject **внутри себя**, потом эмитит событие наружу. Это породило:

1. Двойной HTTP на каждое действие в `list.component`: info-card → accept HTTP → emit → `officeInfoService.onAcceptInvite` → `acceptInviteAction` → второй accept HTTP → revert (т.к. инвайт уже принят) → UI инвайт «не удалён».
2. Костыль `InviteInfoService.markInviteHandled(inviteId)` — добавлен только чтобы синхронить state после внешнего HTTP.
3. Расхождение оптимистичной/реальной логики: на /projects/dashboard работает через `markInviteHandled` (sync only), на /projects/invites через `acceptInviteAction` (HTTP + revert).

### Root Cause

Widget сам выполняет business action вместо того, чтобы быть «глупым» (emit-only). Это нарушает разделение ответственности: parent владеет state, widget рендерит и сигналит.

### Why It Matters

- Двойной HTTP на каждый accept/reject в `list.component`.
- Невозможно сделать единый optimistic UI flow.
- `markInviteHandled` — публичная дыра в инкапсуляции `InviteInfoService`, которая должна была быть `private removeFromState`.

### Priority

**High** (выполнить ДО других state-сервисов, иначе паттерн distorted)

### Impact

arch / perf

### Plan

#### Шаг 2.5.1 — Убрать HTTP из `info-card`

В `info-card.component.ts:138-187`:

- Удалить `rejectInviteUseCase`, `acceptInviteUseCase` inject.
- `onRejectInvite(event, inviteId)` упрощается до `this.stopEventPropagation(event); this.onRejectingInvite.emit(inviteId);`.
- `onAcceptInvite(event, inviteId)` — то же самое.
- Удалить `inviteErrorModal` поле — UI-state ошибок теперь у parent'а (через `officeUIInfoService.applyOpenInviteErrorModal()`).

#### Шаг 2.5.2 — Восстановить нормальный flow в `list.component.ts`

- Вернуть вызов `officeInfoService.onAcceptInvite(event)` / `onRejectInvite(event)`. Их флоу с `acceptInviteAction` / `rejectInviteAction` + навигацией + error modal теперь единственный путь.
- Удалить `inviteInfoService` inject + ручную навигацию + вызов `markInviteHandled`.

#### Шаг 2.5.3 — Восстановить нормальный flow в `projects.component.ts`

- `acceptOrRejectInvite(inviteId)` разбить на два метода `onAcceptInvite` и `onRejectInvite`, либо инжектить `officeInfoService` и звать его (но тогда нужен provider на этом уровне).
- Удалить `inviteInfoService` inject и `markInviteHandled` вызов.
- HTML: разделить `(onRejectingInvite)` и `(onAcceptingInvite)` на разные handlers.

#### Шаг 2.5.4 — Удалить `markInviteHandled` и сделать `removeFromState` приватным

В `invite-info.service.ts`:

- Удалить публичный `markInviteHandled(inviteId)`.
- `removeFromState` остаётся `private`. Никаких внешних дыр в state-сервис.

### Validation

- `/projects/invites`: клик accept/reject — **один HTTP**, инвайт мгновенно исчезает, на error — возвращается + модалка ошибки.
- `/projects/dashboard`: клик accept/reject в myInvites — **один HTTP**, исчезает.
- Шапка (nav): то же самое — **один HTTP**, навигация после accept.
- DevTools Network: на каждый клик строго один запрос к `invites/{id}/accept` или `invites/{id}/reject`, без 4xx errors.

### Possible Hidden Issues

- `info-card` может использоваться в других местах (например, профиль, программа, vacancy-карточки) где accept/reject не нужны — там этот рефактор ничего не сломает, т.к. emit-only вариант обратно совместим.
- Проверить `info-card.component.html` — клик-handlers (`stopEventPropagation`) должны остаться, иначе клик на «принять» будет всплывать в `<a [routerLink]>` обёртку и навигировать неправильно.

---

## Stage 3 — Чистка `OfficeComponent` init и WS-инициализация (P3, High) — ⬜ TODO

### Problem

- `OfficeInfoService.initializationOffice()` запускает industries, programs, has-unreads, WS-connections, invite-init подряд.
- Сейчас при каждом hard reload — всё с нуля.
- При SPA-навигации внутри `/office/*` — один раз за сессию, но если делаем logout → login → logout → login в одной вкладке, есть риск, что WS-листенеры накапливаются.

### Root Cause

WS-инициализация (`connectChatUseCase`, `observeSetOnline`, `observeSetOffline`) живёт в `OfficeInfoService` с `Subject destroy$`. Если `destroy()` корректно отписывает WS-подписку — норма. Если внутри `connectChatUseCase.execute()` создаётся новый WS без закрытия предыдущего — leak.

### Why It Matters

- Дубль WS = дубль входящих сообщений, дубль обработчиков online-статусов.
- Memory leak: каждый раз новый Observable, старый не gc'нется пока есть подписка.

### Priority

**High**

### Impact

arch / stability / memory

### Plan

#### Шаг 3.1 — Аудит WS lifecycle

- Прочитать `ConnectChatUseCase`, `ObserveSetOnlineUseCase`, `ObserveSetOfflineUseCase` (в `api/chat/use-cases/`).
- Понять, открывает ли `connectChatUseCase` каждый раз новый WS или переиспользует.
- Проверить, что `destroy()` действительно закрывает WS (а не просто отписывается на клиенте, оставляя WS открытым).

#### Шаг 3.2 — Вынести WS-инициализацию в отдельный сервис

- Создать `ChatSocketService` (`providedIn: "root"`).
- Метод `ensureConnected()` — идемпотентный, открывает WS только если ещё не открыт.
- Метод `disconnect()` — на logout.
- Подписки на online/offline events идут изнутри сервиса и push'ат в `ChatStateService`.

#### Шаг 3.3 — Из `OfficeInfoService.initializationStatus()` убрать всю WS-логику

Заменить на `chatSocketService.ensureConnected()` — один вызов.

#### Шаг 3.4 — `OfficeInfoService.initializationOffice()` свести к

- `profileState.ensureLoaded()`
- `industryState.ensureLoaded()`
- `programShellState.ensureLoaded()`
- `inviteState.ensureLoaded()`
- `chatUnreadState.ensureLoaded()`
- `chatSocketService.ensureConnected()`

Каждый шаг idempotent → можно вызывать сколько угодно раз без штрафа.

### Validation

- Logout → login 5 раз в одной вкладке: в Chrome DevTools «Sockets» tab должно быть строго одно активное соединение в любой момент.
- Memory profile: heap snapshot до и после login/logout цикла — нет нарастания держателей `WebSocket` / subscriber'ов.

### Possible Hidden Issues

- При logout нужен явный `chatSocketService.disconnect()` + `invalidate()` всех state-сервисов. Сейчас `AuthRepository.logout()` зовёт `chatStateService.reset()` — но это только сбрасывает локальные сигналы, WS остаётся.

---

## Stage 4 — `users/projects/leader/` условная загрузка (P4, Medium) — ✅ DONE (в рамках 1.3)

### Problem

`auth/users/projects/leader/` грузится при открытии **любого** профиля, даже если:

- Это собственный профиль и нет кнопки «пригласить в проект»
- У текущего юзера нет роли «лидер проекта» — некуда приглашать
- UI-элемент модалки приглашения не отображён вообще

### Root Cause

`DetailProfileInfoService.initializationLeaderProjects()` вызывается безусловно из `detail-info.service.ts:242` в ветке «не project / не program».

### Why It Matters

Перегруз на странице чужого профиля без реального юзкейса для запроса.

### Priority

**Medium**

### Impact

perf / UX

### Plan

#### Шаг 4.1 — Перенести `leaderProjects` в `ProfileStateService` как lazy

Метод `ensureLeaderProjectsLoaded()` отдельный от основного `ensureLoaded`.

#### Шаг 4.2 — Звать lazy-loader только из UI с кнопкой invite

Найти компонент, рендерящий «пригласить в проект» (вероятно где-то в `widgets/detail/...`). Условие рендера — текущий юзер ≠ просматриваемый профиль И у текущего юзера есть проекты-лидеры.

Если кнопка не рендерится — `ensureLeaderProjectsLoaded()` не зовётся.

Альтернатива: ленивая загрузка по клику «пригласить» (но это уже UX trade-off — лишний 200ms перед открытием модалки).

#### Шаг 4.3 — Удалить безусловный вызов

Убрать строку `this.detailProfileInfoService.initializationLeaderProjects();` из `detail-info.service.ts:242`.

### Validation

- Откройте чужой профиль вторым юзером без роли лидера → `users/projects/leader/` не идёт.
- Откройте собственный профиль → `users/projects/leader/` не идёт.
- Откройте чужой профиль, имея проект-лидер → запрос идёт только когда модалка приглашения готовится к показу.

### Possible Hidden Issues

- Если в UI где-то ещё читается `profileProjects()` из `DetailProfileInfoService` без условия — нужно проверить, что после lazy-загрузки оно по-прежнему работает.

---

## Stage 5 — Кеш для detail-страниц проектов (P5, Medium) — ⬜ TODO

### Problem

Переход `/projects/5 → /projects/7 → /projects/5` грузит `vacancies/?project_id=5` и `news/` дважды.

### Root Cause

`ProjectInfoResolver` (`info.resolver.ts`) перезапускается на каждой активации маршрута. Кеша по `projectId` нет.

### Why It Matters

- При интенсивной навигации (например, юзер сравнивает несколько проектов) — дублирующие запросы.
- Особенно болезненно на медленных сетях.

### Priority

**Medium** (только после Stage 1-3 — иначе паттерн ещё не устоялся).

### Impact

perf / UX

### Plan

#### Шаг 5.1 — `ProjectDetailStateService` с per-id кешем

Структура: `signal<Record<number, AsyncState<ProjectBundle>>>`. ProjectBundle = `{ project, vacancies, news }` или раздельно — обсудить.

API:

- `ensureLoaded(projectId)` — грузит если ещё не в кеше или TTL истёк.
- `refresh(projectId)` — force.
- `invalidate(projectId)` — на mutation (создание вакансии, etc.).
- `get(projectId): Signal<AsyncState<ProjectBundle>>` — read.

#### Шаг 5.2 — TTL стратегия

- Простая: TTL 60 секунд для bundle. После — `ensureLoaded` форс.
- Сложнее: WS-инвалидация при изменении проекта (отложить).

Я бы начал с TTL 60s и manual `invalidate` при known mutations.

#### Шаг 5.3 — Переписать `ProjectInfoResolver`

- Либо удалить и звать `projectDetailState.ensureLoaded(projectId)` из компонента в `ngOnInit`.
- Либо оставить тонкий resolver: `(route) => { const id = +route.paramMap.get('projectId'); projectDetailState.ensureLoaded(id); return true; }`.

Я бы убрал резолвер совсем — UI читает signal, рендерит loader пока `isLoading`.

#### Шаг 5.4 — Invalidate hooks

В местах, где меняется проект (`project.update`, добавление вакансии, etc.) — вызвать `projectDetailState.invalidate(projectId)` или сразу `refresh(projectId)`.

### Validation

- `/projects/5 → /projects/7 → /projects/5` за 30 секунд: на возврате к 5 нет повторных HTTP к `vacancies/`, `news/`, `projects/5/`.
- После создания вакансии: возврат на ту же страницу показывает свежий список без manual refresh.

### Possible Hidden Issues

- Bundle vs separate fetches — если `project`, `vacancies`, `news` грузятся параллельно, инвалидация одного не должна сбрасывать остальные.
- При WS-обновлении проекта нужен push в state. Это уже Stage 6+.

---

## Stage 6 — Persist reference data (P6, Medium) — ⬜ TODO

### Problem

`users/types`, `users/roles`, `industries` грузятся на каждом hard reload, хотя меняются раз в месяц/год.

### Priority

**Medium**

### Impact

perf (cold start)

### Plan

#### Шаг 6.1 — Сериализация в `localStorage`

В `ProfileStateService.ensureLoaded()` и `IndustryStateService.ensureLoaded()`:

1. На старте — попытка hydrate из `localStorage` (с версией ключа и TTL).
2. Если есть — сразу `success(data)`, рендерим UI мгновенно.
3. Параллельно фоном — `refresh()`. Если данные изменились — обновляем signal.

Это SWR-style паттерн (stale-while-revalidate).

#### Шаг 6.2 — Ключ кеша с версией

Формат ключа: `procollab:cache:industries:v1`. При смене формата bumpим версию. Так избегаем багов на старых клиентах.

#### Шаг 6.3 — TTL

- Industries / types / roles — 24h.
- Profile — НЕ persist'им (security: stale profile может ввести в заблуждение).

#### Шаг 6.4 — Очистка на logout

В `logout()` — `localStorage.removeItem` всех `procollab:cache:*` ключей.

### Validation

- Hard reload на authenticated юзере: `industries/`, `users/types/`, `users/roles/` либо вообще не идут (если в TTL), либо идут фоном после первого рендера.
- Logout → проверка `localStorage` → нет наших ключей.

### Possible Hidden Issues

- `plainToInstance` нужно re-применить при hydrate из localStorage, потому что JSON.parse не восстанавливает классы.
- Если backend меняет shape — клиенты с старым кешем могут упасть. Версия ключа спасёт, но нужна дисциплина её bump'ить.

---

## Stage 7 — Нормализация query params (P7, Low) — ⬜ TODO

### Problem

`projects/?limit=16` (первая страница) vs `projects/?offset=16&limit=16` (последующие) — разные URL.

### Priority

**Low**

### Impact

DX / consistency / любой будущий HTTP-кеш по URL

### Plan

В адаптере `project-http.adapter.ts` (или где формируется URL) — всегда передавать `offset` явно, даже если 0. Тогда первая страница тоже будет `projects/?offset=0&limit=16`.

### Validation

Pagination — все запросы к `projects/` имеют одинаковый формат query string.

---

## Stage 8 — Проверка дублирующего `specializations/nested` (P7, Low) — ⬜ TODO

### Problem

На `office/profile/edit?editingStep=main` идёт:

```
auth/users/specializations/nested - 301
auth/users/specializations/nested - 301
auth/users/specializations/nested - 200
```

### Гипотезы

- Два редиректа подряд + финальный 200 = тройной запрос
- Или две параллельные подписки на тот же observable + один редирект

### Plan

Открыть Network в DevTools, выбрать каждый из трёх — сравнить:

- Initiator (стэк вызова)
- Request headers (тот же ли referer)
- Если у двух одинаковый initiator stack — это retry/double-subscribe. Если разные — два независимых caller'а.

Затем grep по коду: `specializations/nested`. Возможные источники — `auth-http.adapter.ts` или специализации в `api/specializations/`.

### Priority

**Low** (один из 100 запросов, не критично)

---

# Dependency chain (порядок работ)

Строгая зависимость:

```
Stage 1 (Shell State Layer)
   ↓
Stage 2 (Удаление резолверов)   — нужен InviteStateService
Stage 2.5 (Рефакторинг info-card) — закрывает двойной HTTP, убирает markInviteHandled
Stage 3 (WS-чистка)             — нужен ChatUnreadState + независим от 2
Stage 4 (leader projects)       — нужен ProfileStateService.lazy
   ↓
Stage 5 (project detail cache) — паттерн state-сервиса должен быть стабилизирован
   ↓
Stage 6 (persist reference)   — нужен ProfileState + IndustryState
   ↓
Stage 7 (params normalization) — независим, можно в любой момент
Stage 8 (specializations debug)— независим, можно в любой момент
```

**Запрещено**: чинить Stage 5/6 до Stage 1. Иначе ты впишешь второй некросс-консистентный кеш и удвоишь техдолг.

**Можно параллелить**: Stage 2, 3, 4 после готового Stage 1.

---

# Чеклист по компонентам после миграции

Сделано:

- [x] `OfficeResolver` удалён (`ui/pages/office/office.resolver.ts`)
- [x] `ProjectsInvitesResolver` удалён (`ui/pages/projects/list/invites.resolver.ts`)
- [x] `OfficeInfoService.initializationInvites()` → `inviteInfoService.ensureLoaded()`
- [x] `OfficeUIInfoService.applySetInvites` — выпилен (invites через сигнал сервиса)
- [x] `Subject<void> destroy$` убран из root state-сервисов (в `OfficeInfoService` остался — он component-scoped, это ок)
- [x] `InviteInfoService.loadedInvites/loadingInvites` → `AsyncState`
- [x] `forkJoin([fetchUserRoles, fetchChangeableRoles])` вызов убран из `AppComponent` (переехало в office-init → `ensureProfileLoaded()`); **остался неиспользуемый импорт `forkJoin` — см. D4**
- [x] фасад `IndustryInfoService` схлопнут в `IndustryStateInfoService` (+ перенесён `getOne`)
- [x] `ChatStateService.unread$` / `setUnread` удалены, бейдж читает `chatUnreadState.hasUnreads()`

Отложено (реестр долга):

- [ ] switchAll-мост в `AuthRepository` — снести после миграции читателей `authRepository.profile` на сигнал (**D1**, Шаг 1.3.1)
- [ ] `ProgramShellInfoService.invalidate()` в logout (**D2**)
- [ ] типизация `next: (result: any)` (**D3**)
- [ ] неиспользуемый импорт `forkJoin` в `AppComponent` (**D4**)

И проверить (инварианты):

- [x] `AuthRequiredGuard` остаётся на `authRepository.fetchProfile()` (вариант A — cache-aware, гард в `core/` не достаёт `ProfileInfoService`).
- [x] HTTP-триггеры идемпотентны на уровне state-сервиса (двойной `ensureLoaded` ≠ двойной HTTP — через `inflight`).
- [x] У state-сервисов есть `invalidate()`, зовутся в `logout()` (кроме program — D2).
- [ ] WS открывается ровно один раз за сессию, закрывается на logout (**Stage 3**).

---

# Метрики «успеха» после полной миграции

| Сценарий                                               | До                                           | Цель                                       |
| ------------------------------------------------------ | -------------------------------------------- | ------------------------------------------ |
| Hard reload `/office/program/all`                      | 8 запросов                                   | 3-4 (только page-specific + WS handshake)  |
| SPA-навигация feed → projects/all                      | ~6 запросов                                  | 1-2 (только page-specific)                 |
| `/office/projects/invites` (hard reload)               | 3× `invites/` + остальное                    | 1× `invites/`                              |
| Возврат на `/projects/5` после `/projects/7` (за <60s) | Все detail-запросы заново                    | 0 запросов (из кеша)                       |
| Открытие чужого профиля без роли лидера                | `users/projects/leader/` грузится            | Не грузится                                |
| Cold reload reference data                             | `industries/`, `types/`, `roles/` каждый раз | Из localStorage мгновенно, фоновый refresh |

---

# Открытые вопросы (нужно решить до начала)

1. **TTL для project detail кеша** — 60s достаточно или меньше? Это завязано на UX-ожидание «свежести».
2. **Refresh-стратегия для shell state** — нужен ли «refresh on focus» (когда вкладка вернулась в активное окно)? Это отдельная фича, но дешёвая.
3. **In-flight deduplication** — общая ли это утилита или каждый state-сервис сам? Я бы сделал общую (helper в `domain/shared/`).
4. **WS-handshake как метрика** — `connection/handshake` стреляет на каждом reload, это норма. Но если он стреляет дважды на одну сессию — leak.

Решить их можно по ходу Stage 1, не блокирующе.
