<!-- @format -->

# Удаление уведомления о фоновом соединении скрытых чатов

База: `dev` на `c2413ce6`, после merge #405. Чаты скрыты в навигации, но `OfficeInfoService` продолжает подключаться к `/ws/chat/` для обновления онлайн-статусов пользователей. Потеря этого канала не доказывает недоступность HTTP API или остальных разделов платформы.

## Изменение

Удалён `ConnectionStatusToastService` и его глобальная инициализация в `AppComponent`. Уведомление о недоступности скрытых чатов больше не появляется. Автоматический retry, очередь сообщений, обновление онлайн-статусов, API-контракты, бизнес-правила, навигация и responsive-стили не изменены. Сервис обычных snackbar и сообщения об ошибках пользовательских операций сохранены.

## Acceptance criteria и review

| AC  | Требование                                        | Evidence                                                                                                                                                          |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Фоновый сбой не создаёт глобальное предупреждение | AppComponent regression test; browser: первый и второй обрыв, включая retry после порога; MutationObserver подтверждает отсутствие даже кратковременного snackbar |
| 2   | Сохраняются переподключение и онлайн-статусы      | WebsocketService tests; browser: после обоих восстановлений `set_online` обновляет badge профиля, `set_offline` его убирает                                       |
| 3   | Обычные ошибки не подавляются                     | AppComponent test подтверждает доставку другого error snackbar; SnackbarComponent tests; source review: общий обработчик уведомлений и HTTP/API paths не менялись |
| 4   | Desktop/mobile layout сохранён                    | Source review: HTML/SCSS, компоненты страниц и их раскладка не изменены; единственное исчезновение UI — согласованное предупреждение при фоновом сбое             |

Review: все AC проверены указанным способом, существенных незакрытых замечаний нет. Изменение frontend-only; permissions, миграции данных и backend deployment не затронуты.

## Проверки

- Адресные tests: **14 tests / 4 files, exit 0** (`AppComponent`, `WebsocketService`, `ChatRealtimeRepository`, `SnackbarComponent`).
- `npm run build:pr`: exit 0.
- `npm run lint:ts`: exit 0, 0 errors и 6 существующих warnings вне diff.
- Browser на 390 px: синтетический недоступный WebSocket при рабочем HTTP → retry после порога без snackbar → reconnect → online/offline badge → повторный обрыв без snackbar → reconnect и online badge; все assertions прошли, console errors отсутствуют.
- `npm run test:ci`: **2014 tests / 406 files, exit 0**. Три существующих исключения legacy specs в конфигурации Vitest не изменены (`projects.component.spec.ts`, `program.component.spec.ts`, `editor-submit-button.directive.spec.ts`).
- `npm run format:check`: проверка полного tracked-снимка Git index с LF, как в CI; приватные build/QA artifacts исключены из снимка.

## Воспроизведение browser check

Собрать текущую ветку через `npm run build:pr`, установить `PLAYWRIGHT_MODULE`/`CHROME_PATH` на доступные Playwright и Chrome. В PowerShell:

```powershell
$env:QA_BUILD_ROOT = 'dist/social_platform'
node docs/mobile-smoke-polish/connection.cjs http://127.0.0.1:4452 .desktop-regression/hidden-chat-notice/browser
```

`preview.cjs` доставляет неизменённые build-файлы напрямую через Playwright route, поэтому локальный HTTP server не нужен. API и WebSocket заменены синтетическими fixtures; live-запросов нет. JSON результата и screenshot находятся в указанном приватном output-каталоге.

## Не проверено

Реальные iOS/Android, Safari/WebKit и сетевые события на dev-стенде. В GitHub нет workflow для PR: проверочный deploy workflow запускается по push в dev после merge. На устройствах после merge проверить, что возврат из фона не вызывает глобального предупреждения о чатах.
