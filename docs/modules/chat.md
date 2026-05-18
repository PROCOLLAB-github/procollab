<!-- @format -->

# Module: `chat`

Чаты — личные («direct») и проектные. Реализуется через WebSocket для real-time + REST для истории сообщений и файлов. Самый сложный по событийной модели модуль приложения: 7 типов событий чата + статусы пользователей online/offline + индикатор «печатает».

Direct- и project-chat используют общий page-scoped фасад `ChatDirectInfoService` и UI-сервис `ChatDirectUIInfoService`; команды, загрузка истории и подписки на WebSocket-события вынесены в use-case слой. Отдельных `ChatDirectService` / `ChatProjectService` в текущем коде нет.

## Назначение

- **Список чатов** (`/office/chats/directs`, `/office/chats/groups`) — направления чатов и проектные группы.
- **Direct chat** (`/office/chats/:chatId`) — диалог с другим пользователем.
- **Project chat** (через `pages/projects/detail/chat`) — общий чат проекта (см. [`docs/modules/project.md`](project.md)).
- **Real-time** через WebSocket (`environment.websocketUrl + "/chat/"`) — отправка / приём сообщений, статусы, typing.
- **REST** для истории (`/messages/...`) и файлов (`/files`).
- **Глобальный индикатор непрочитанных** в `app-profile-control-panel` через `ChatStateService.unread$`.

---

## Domain (`domain/chat/`)

### `chat-message.model.ts`

```ts
export class ChatFile {
  name: string;
  extension: string; // TODO: switch to mimetype when back will be ready
  size: number;
  link: string;
  user: number;
  datetimeUploaded: string;
}

export class ChatMessage {
  id: number;
  author: User;
  isEdited: boolean;
  isRead: boolean;
  isDeleted: boolean;
  replyTo: ChatMessage | null; // self-referential
  text: string;
  createdAt: string;
  files: ChatFile[];

  static default(): ChatMessage;
}
```

### `chat-item.model.ts` (chat list item)

См. файл — модель чата для списка (preview последнего сообщения, unread, etc.).

### `chat.model.ts` — DTO для команд и событий

| DTO                              | Что                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `SendChatMessageDto`             | `{ chatType: "direct" \| "project", chatId, text, fileUrls, replyTo: number \| null }` |
| `EditChatMessageDto`             | `{ chatType, chatId, text, messageId }`                                                |
| `DeleteChatMessageDto`           | `{ chatType, chatId, messageId }`                                                      |
| `ReadChatMessageDto`             | `{ chatType, chatId, messageId }`                                                      |
| `TypingInChatDto`                | `{ chatType, chatId }`                                                                 |
| `OnChatMessageDto` (event)       | `{ chatId, message: ChatMessage }`                                                     |
| `OnEditChatMessageDto` (event)   | `{ chatId, message: ChatMessage }`                                                     |
| `OnDeleteChatMessageDto` (event) | `{ chatType, chatId, messageId }`                                                      |
| `OnReadChatMessageDto` (event)   | `{ chatType, chatId, messageId, userId }`                                              |
| `TypingInChatEventDto` (event)   | `{ chatType, chatId, userId, endTime }`                                                |
| `OnChangeStatus` (event)         | `{ userId }` (online/offline)                                                          |

### `ChatEventType` enum

WebSocket-события сервера (фронт регистрирует обработчики):

```ts
enum ChatEventType {
  NEW_MESSAGE = "new_message",
  EDIT_MESSAGE = "edit_message",
  DELETE_MESSAGE = "delete_message",
  READ_MESSAGE = "message_read",
  TYPING = "user_typing",
  SET_ONLINE = "set_online",
  SET_OFFLINE = "set_offline",
}
```

### Ports

| Port                 | Файл                            | Что                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatRepositoryPort` | `ports/chat.repository.port.ts` | HTTP/REST: `loadMessages(projectId, offset?, limit?)`, `loadProjectFiles(projectId)`, `hasUnreads()`.                                                                                                                                    |
| `ChatRealtimePort`   | `ports/chat-realtime.port.ts`   | WebSocket: команды (`sendMessage`, `editMessage`, `deleteMessage`, `readMessage`, `startTyping`) + события (`onMessage`, `onEditMessage`, `onDeleteMessage`, `onReadMessage`, `onTyping`, `onSetOnline`, `onSetOffline`). + `connect()`. |

DI-биндинг (`infrastructure/di/chat.providers.ts`):

```ts
{ provide: ChatRepositoryPort,  useExisting: ChatRepository },
{ provide: ChatRealtimePort,     useExisting: ChatRealtimeRepository },
```

> Разделение на два порта (REST + WebSocket) — образцовая CQRS-архитектура для real-time. Команды (sendMessage и т.д.) идут через WebSocket, события (onMessage и т.д.) приходят через тот же сокет, REST остаётся для истории и снапшотов.

---

## Use-cases (16 шт., `api/chat/use-cases/`)

| Use-case                      | Тип        | Параметры                    | Что                                   |
| ----------------------------- | ---------- | ---------------------------- | ------------------------------------- |
| `LoadMessagesUseCase`         | REST       | `projectId, offset?, limit?` | История сообщений.                    |
| `LoadProjectFilesUseCase`     | REST       | `projectId`                  | Файлы из чата.                        |
| `CheckUnreadsUseCase`         | REST       | —                            | Есть ли непрочитанные (для бейджа).   |
| `ConnectChatUseCase`          | WS         | —                            | Установить WebSocket.                 |
| `SendMessageUseCase`          | WS command | `dto: SendChatMessageDto`    | Отправить сообщение.                  |
| `EditMessageUseCase`          | WS command | `dto: EditChatMessageDto`    | Редактировать.                        |
| `DeleteMessageUseCase`        | WS command | `dto: DeleteChatMessageDto`  | Удалить.                              |
| `ReadMessageUseCase`          | WS command | `dto: ReadChatMessageDto`    | Отметить прочитанным.                 |
| `StartTypingUseCase`          | WS command | `dto: TypingInChatDto`       | Я печатаю.                            |
| `ObserveMessagesUseCase`      | WS event   | —                            | `Observable<OnChatMessageDto>`.       |
| `ObserveEditMessageUseCase`   | WS event   | —                            | `Observable<OnEditChatMessageDto>`.   |
| `ObserveDeleteMessageUseCase` | WS event   | —                            | `Observable<OnDeleteChatMessageDto>`. |
| `ObserveReadMessageUseCase`   | WS event   | —                            | `Observable<OnReadChatMessageDto>`.   |
| `ObserveTypingUseCase`        | WS event   | —                            | `Observable<TypingInChatEventDto>`.   |
| `ObserveSetOnlineUseCase`     | WS event   | —                            | `Observable<OnChangeStatus>`.         |
| `ObserveSetOfflineUseCase`    | WS event   | —                            | `Observable<OnChangeStatus>`.         |

`Observe*UseCase` — это «адаптеры события для UI-слоя»: facade подписывается на них, обновляет `signal`-ы и `BehaviorSubject` в `ChatStateService`.

Команды (`SendMessageUseCase`, `EditMessageUseCase`, `DeleteMessageUseCase`, `ReadMessageUseCase`, `StartTypingUseCase`) не возвращают UI-state напрямую; они делегируют в `ChatRealtimePort`, а состояние страницы меняется после входящих WebSocket-событий.

---

## Facades (`api/chat/facades/`)

| Facade                      | Provided                   | Что                                                                                                                                               |
| --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatInfoService`           | страница списка чатов      | Управление списком чатов (directs / groups).                                                                                                      |
| `ChatUIInfoService`         | страница списка чатов      | UI-state списка.                                                                                                                                  |
| `ChatDirectInfoService`     | direct chat и project chat | Жизненный цикл чата: route data → `LoadMessagesUseCase`, подписки на `Observe*UseCase`, команды через `*MessageUseCase`, typing и read events.    |
| `ChatDirectUIInfoService`   | direct chat и project chat | `messages: signal<ChatMessage[]>`, `chatFiles`, `replyMessage`, `typingPersons`, `currentUserId`, `fetching`, состояние мобильной боковой панели. |
| `ProjectsDetailChatService` | страница project chat      | Минимальный page-scoped сервис с `destroy$`; основная chat-логика страницы проекта находится в `ChatDirectInfoService`.                           |

### Глобальные сервисы

| Сервис             | Provided | Что                                                                                                                                                                              |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatStateService` | `root`   | Глобальное состояние: `unread$ BehaviorSubject<boolean>` (бейдж непрочитанных в шапке), `userOnlineStatusCache: BehaviorSubject<Record<number, boolean>>` (кеш online-статусов). |

---

## Repositories

### `ChatRepository` (REST)

`infrastructure/repository/chat/chat.repository.ts`. Pass-through к `ChatHttpAdapter` с `plainToInstance(ChatMessage, ...)` для типизации.

### `ChatRealtimeRepository` (WebSocket)

`infrastructure/repository/chat/chat-realtime.repository.ts`. Делегирует в `ChatWsAdapter`. Реализует все команды + события из `ChatRealtimePort`.

---

## HTTP endpoints (`infrastructure/adapters/chat/chat-http.adapter.ts`)

| Метод                                      | HTTP | URL                            | Параметры                            | Ответ                        |
| ------------------------------------------ | ---- | ------------------------------ | ------------------------------------ | ---------------------------- |
| `loadMessages(projectId, offset?, limit?)` | GET  | `/messages/...`                | `?project=<id>&offset=<n>&limit=<n>` | `ApiPagination<ChatMessage>` |
| `loadProjectFiles(projectId)`              | GET  | `/messages/files?project=<id>` | —                                    | `ChatFile[]`                 |
| `hasUnreads()`                             | GET  | `/messages/has_unreads/`       | —                                    | `boolean`                    |

---

## WebSocket adapter (`infrastructure/adapters/chat/chat-ws.adapter.ts`)

Использует `WebsocketService` из [`docs/core/services.md`](../core/services.md#websocketservice) для подключения к `environment.websocketUrl + "/chat/"`. Передаёт access-токен через subprotocol `["Bearer", token]`.

При `connect()`:

- Открывает WS соединение.
- Регистрирует обработчики на `ChatEventType` строки.
- Каждое событие проходит через camelcase-преобразование (`camelcaseKeys`).

При командах — пакует `{ type: ChatEventType, content: payload }`, сериализует и шлёт в сокет.

`isConnected: boolean` — публичный флаг состояния.

> WebSocketService реализует **переподключение** (`retry`-логика с `environment.websocketReconnectionInterval / MaxAttempts` — 5 попыток, 500мс интервал на dev / 5000мс на prod).

---

## Routes (`ui/routes/chat/`)

`CHAT_ROUTES` описывает список и direct-чаты, но блок `path: "chats"` в `ui/routes/office/office.routes.ts` сейчас закомментирован. Поэтому standalone-раздел `/office/chats` недоступен из office-router; project-chat остаётся доступен как дочерняя страница проекта.

### `chat.routes.ts`

```
/office/chats/
  /                   → redirect to directs
  /directs            → ChatComponent (resolve: ChatResolver)
  /groups             → ChatComponent (resolve: ChatGroupsResolver)
  /:chatId            → lazy ./chat-direct.routes
```

### `chat-direct.routes.ts`

```
/office/chats/:chatId
  ""                  → ChatDirectComponent (resolve: ChatDirectResolver)
```

---

## Pages (`ui/pages/chat/`)

| Page                  | Файл                                              | Selector          | Что                                                                                                    |
| --------------------- | ------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `ChatComponent`       | `pages/chat/chat.component.ts`                    | `app-chat`        | Список чатов с табами directs/groups.                                                                  |
| `ChatCardComponent`   | `pages/chat/chat-card/chat-card.component.ts`     | `app-chat-card`   | Карточка одного чата в списке (превью + unread).                                                       |
| `ChatDirectComponent` | `pages/chat/chat-direct/chat-direct.component.ts` | `app-chat-direct` | Диалог с одним пользователем. Использует `<app-chat-window>` + `<app-message-input>` (см. ui-widgets). |

### Resolvers

- `ChatResolver` — список directs.
- `ChatGroupsResolver` — список project groups.
- `ChatDirectResolver` — данные конкретного чата (последние N сообщений + участники).

---

## Widgets

| Widget                | Где                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<app-chat-window>`   | [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md#chatwindowcomponent--messageinputcomponent) — окно с виртуальным скроллом сообщений. |
| `<app-message-input>` | то же — поле ввода с reply + upload.                                                                                                                         |

---

## Consumers

| Где                                                      | Как использует                                                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pages/projects/detail/chat`                             | Project chat: `ProjectChatComponent` переиспользует `ChatDirectInfoService` / `ChatDirectUIInfoService` с типом `"project"`. |
| `widgets/header`, `app-profile-control-panel` (`@uilib`) | Бейдж непрочитанных через `ChatStateService.unread$`.                                                                        |
| `widgets/info-card`, `widgets/detail`                    | online/offline индикатор через `ChatStateService.userOnlineStatusCache`.                                                     |
| `app.component.ts`                                       | На старте connects WS, инициирует `CheckUnreadsUseCase` для бейджа.                                                          |

---
