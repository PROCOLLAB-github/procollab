<!-- @format -->

# Module: `invite`

Приглашения пользователей в проекты. Лидер проекта (или участник с правами) приглашает пользователя на роль; приглашённый принимает или отклоняет; отправитель может отозвать приглашение или изменить роль.

## Назначение

- **Отправка** приглашения пользователю на конкретную роль/специализацию в проекте.
- **Принятие / отклонение** приглашения пользователем-получателем.
- **Отзыв** уже отправленного приглашения отправителем.
- **Изменение роли / специализации** существующего приглашения.
- **Список моих приглашений** — отображается в шапке через `app-profile-control-panel` (см. [`docs/uilib.md`](../uilib.md)) с бейджем количества.
- **Список приглашений проекта** — для отображения в `pages/projects/edit/components/project-team-step` и в `pages/projects/list?type=invites`.

Связан с [`project`](project.md) (приглашение принадлежит проекту, accept меняет состав команды) и [`auth`](auth.md) (`User` и `sender`).

---

## Domain (`domain/invite/`)

### `invite.model.ts`

```ts
export class Invite {
  id: number;
  datetimeCreated: string;
  datetimeUpdated: string;
  isAccepted?: boolean; // undefined = ещё не решили
  motivationalLetter?: string;
  project: Project; // полная модель проекта
  role: string; // должность в проекте
  specialization?: string;
  user: User; // получатель
  sender: User; // отправитель
}
```

### `commands/`

```ts
interface SendForUserCommand {
  userId;
  projectId;
  role: string;
  specialization?: string;
}
interface UpdateInviteCommand {
  inviteId;
  role: string;
  specialization?: string;
}
```

### `events/` — все три эмитятся use-case'ами и слушаются `InviteRepository` + `ProjectRepository`

| Event          | Payload                                 | Где обрабатывается                          |
| -------------- | --------------------------------------- | ------------------------------------------- |
| `AcceptInvite` | `{ inviteId, projectId, userId, role }` | `InviteRepository`: `myInvitesCount$ -= 1`. |
| `RejectInvite` | `{ inviteId, projectId, userId }`       | `InviteRepository`: `myInvitesCount$ -= 1`. |
| `RevokeInvite` | `{ inviteId, projectId, userId }`       | (никто не подписан в текущем коде)          |

> `AcceptInvite` также косвенно влияет на `ProjectRepository` (новый коллаборатор), но прямой подписки на это событие в `ProjectRepository` нет — вместо этого инвалидация идёт через `RemoveProjectCollaborator` event (зеркальная операция). Это асимметрия: при invite-accept надо бы тоже инвалидировать проект.

### `ports/invite.repository.port.ts`

```ts
abstract class InviteRepositoryPort {
  sendForUser(userId, projectId, role, specialization?): Observable<Invite>;
  revokeInvite(invitationId): Observable<Invite>;
  acceptInvite(inviteId): Observable<Invite>;
  rejectInvite(inviteId): Observable<Invite>;
  updateInvite(inviteId, role, specialization?): Observable<Invite>;
  getMy(): Observable<Invite[]>;
  getByProject(projectId): Observable<Invite[]>;
}
```

DI-биндинг (`infrastructure/di/invite.providers.ts`):

```ts
{ provide: InviteRepositoryPort, useExisting: InviteRepository }
```

---

## Use-cases (7 шт., `api/invite/use-cases/`)

| Use-case                   | Параметры                           | Возвращает                | Эмитит событие |
| -------------------------- | ----------------------------------- | ------------------------- | -------------- |
| `SendForUserUseCase`       | `command: SendForUserCommand`       | `Result<Invite, error>`   | —              |
| `RevokeInviteUseCase`      | `inviteId, projectId, userId`       | `Result<Invite, error>`   | `RevokeInvite` |
| `AcceptInviteUseCase`      | `inviteId, projectId, userId, role` | `Result<Invite, error>`   | `AcceptInvite` |
| `RejectInviteUseCase`      | `inviteId, projectId, userId`       | `Result<Invite, error>`   | `RejectInvite` |
| `UpdateInviteUseCase`      | `command: UpdateInviteCommand`      | `Result<Invite, error>`   | —              |
| `GetMyInvitesUseCase`      | —                                   | `Result<Invite[], error>` | —              |
| `GetProjectInvitesUseCase` | `projectId`                         | `Result<Invite[], error>` | —              |

Ошибки отправки `SendForUserUseCase` преобразуются централизованным
`mapInviteSendError` в `InviteSendError { kind, message }`, без raw cause в UI.
Остальные use cases сохраняют `{ kind: "...error", cause? }`.

### Ошибки отправки и жизненный цикл формы

Mapper в `api/invite/mappers/` распознаёт только известные ошибки `user` из
ожидаемых HTTP 400/422: `user_not_found`, `already_leader`, `already_member`,
`already_invited`, `not_program_participant`. Для 401/403, network/status 0,
5xx и неизвестных ошибок используются контролируемые `unauthorized`, `forbidden`,
`network`, `server`, `validation`, `unknown` сообщения. Сырые массивы,
английский DRF text и backend body никогда не отображаются. Ответ 500 с `"error"`
даёт «Не удалось отправить приглашение. Попробуйте ещё раз позже.»
Профильный invite facade использует те же typed kinds для существующих состояний,
без повторного разбора текста backend.

`ProjectTeamService` очищает backend error, валидирует форму через
`ValidationService`, затем отправляет запрос. Invalid required/pattern не допускают
HTTP. Пока запрос выполняется, кнопка показывает loader и disabled; повторный
вызов также блокируется в facade. Видимость input block хранит `ProjectTeamUIService`.

Ошибка завершает loading, но оставляет форму открытой и сохраняет ссылку/роль.
Одно конкретное сообщение выводится рядом со ссылкой в `role="alert"`.
Изменение link, role или specialization очищает backend error, не удаляя
frontend validators. Retry создаёт новый запрос. Только успех добавляет Invite,
очищает transient state и форму и скрывает input block. Reset сохраняет required/pattern.

Backend rules, POST `/invites/`, payload и приглашения/участие в программе не меняются.
Ограничения размера команды, membership, submission freeze и дальнейшие изменения
invite lifecycle не входят в этот UI cleanup.

---

## Repository (`infrastructure/repository/invite/invite.repository.ts`)

`InviteRepository implements InviteRepositoryPort`. Pass-through к адаптеру с `plainToInstance(Invite, ...)`.

**Особенность**: хранит `myInvitesCount$: BehaviorSubject<number>(0)` для бейджа в шапке. Подписан на `EventBus`:

```ts
this.eventBus.on<AcceptInvite>("AcceptInvite").subscribe(() => {
  this.myInvitesCount$.next(Math.max(0, currentCount - 1));
});

this.eventBus.on<RejectInvite>("RejectInvite").subscribe(() => {
  this.myInvitesCount$.next(Math.max(0, currentCount - 1));
});
```

> Счётчик уменьшается на accept/reject, но **не инкрементируется** при создании нового приглашения через push-уведомления / WebSocket — это пробел. Текущая логика: при первой загрузке `getMy()` UI вычисляет `length`, обновления только локальные.

---

## HTTP endpoints (`infrastructure/adapters/invite/invite-http.adapter.ts`)

Префикс `/invites`.

| Метод                                                   | HTTP   | URL                            | Тело / параметры                          | Ответ      |
| ------------------------------------------------------- | ------ | ------------------------------ | ----------------------------------------- | ---------- |
| `sendForUser(userId, projectId, role, specialization?)` | POST   | `/invites/`                    | `{ user, project, role, specialization }` | `Invite`   |
| `revokeInvite(invitationId)`                            | DELETE | `/invites/<invitationId>`      | —                                         | `void`     |
| `acceptInvite(inviteId)`                                | POST   | `/invites/<inviteId>/accept/`  | `{}`                                      | `Invite`   |
| `rejectInvite(inviteId)`                                | POST   | `/invites/<inviteId>/decline/` | `{}`                                      | `Invite`   |
| `updateInvite(inviteId, role, specialization?)`         | PATCH  | `/invites/<inviteId>`          | `{ role, specialization }`                | `Invite`   |
| `getMy()`                                               | GET    | `/invites/`                    | —                                         | `Invite[]` |
| `getByProject(projectId)`                               | GET    | `/invites/`                    | `?project=<id>&user=any`                  | `Invite[]` |

> `decline` / `accept` имеют trailing slash, `revoke` (`DELETE /invites/<id>`) и `updateInvite` (`PATCH /invites/<id>`) — без. Несогласованно (особенность бэка).

> Параметр `?user=any` в `getByProject` — вернуть приглашения проекта от ВСЕХ пользователей (без фильтра по получателю).

---

## Routes / Pages

Отдельных `ui/routes/invite/` или `ui/pages/invite/` нет — приглашения отображаются:

- В `pages/projects/list/list.component.ts` при `?type=invites` — список моих приглашений.
- В `pages/projects/edit/components/project-team-step/...` — приглашения этого проекта (отправленные).
- В `widgets/header` (`app-header`) и `app-profile-control-panel` (`@uilib`) — бейдж количества + dropdown с принять/отклонить.

Resolver `ProjectsInvitesResolver` в [`docs/modules/project.md`](project.md) дёргает `GetMyInvitesUseCase`.

---

## Widgets

| Widget                          | Где                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `<app-invite-manage-card>`      | `@uilib` ([`docs/uilib.md`](../uilib.md#invitemanagecardcomponent-app-invite-manage-card)) — карточка одного invite с accept/reject. |
| `<app-info-card type="invite">` | `widgets/info-card` — представление как часть списка приглашений в виде карточки.                                                    |

---

## Consumers (за пределами модуля)

| Где                                                          | Как использует                                                                                                                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `widgets/header`, `widgets/profile-control-panel` (`@uilib`) | Отображение количества + меню.                                                                                                                                   |
| `pages/projects/edit/components/project-team-step`           | `SendForUserUseCase` (отправка), `UpdateInviteUseCase` (изменение роли), `RevokeInviteUseCase` (отзыв), `GetProjectInvitesUseCase` (список приглашений проекта). |
| `pages/projects/list` (тип `invites`)                        | `GetMyInvitesUseCase` (список моих приглашений).                                                                                                                 |
| `domain/auth/user.model.ts`                                  | `Invite.user`/`sender: User`.                                                                                                                                    |
| `pages/profile/detail/main`                                  | Может показывать приглашения профиля.                                                                                                                            |
| `utils/inviteToProjectMapper.ts`                             | Утилита маппинга `Invite[]` → `any[]` для отображения в проектных списках (см. [`docs/social-platform/shared.md`](../social-platform/shared.md)).                |

---
