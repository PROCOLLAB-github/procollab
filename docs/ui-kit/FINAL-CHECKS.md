<!-- @format -->

# Финальные проверки перед merge PR #401

Проверка выполнена 2026-10-04 на production-сборке UI Kit `74a94c9b` с финальным CSS-исправлением auth. Локальный Chrome/Playwright, синтетические API fixtures, ширины **320, 390, 768, 1440 px**. Все запросы изменения данных перехвачены; реальный backend не изменялся.

**64/64 passed:** 32 проверки восьми экранов + 32 проверки восьми состояний. Данные: [final-results.json](final-results.json), [final-verify.log](final-verify.log), [воспроизводимый сценарий](final-verify.cjs). В каждой проверке подтверждены ожидаемый URL/контент, отсутствие горизонтального overflow и неожиданных pageerror/console.error. Ожидаемые HTTP 500 и сообщение HTTP logger при искусственной ошибке отдельно записаны в `expectedErrors`; успешный retry подтверждён в `retryPassed`.

## Разделы

Визуально просмотрены mobile/desktop screenshots всех шести запрошенных разделов и планшетные screenshots. Карточки и действия помещаются в viewport, длинный контент переносится/сокращается предусмотренным способом, формы и tabs остаются доступными. Оба проверенных шага onboarding просмотрены. Ниже ссылки на 390/1440 px; все четыре ширины сохранены в [screenshots/final](screenshots/final).

| Экран            | Mobile                                        | Desktop                                         | Автопроверка |
| ---------------- | --------------------------------------------- | ----------------------------------------------- | ------------ |
| Проекты          | [390](screenshots/final/projects-390.png)     | [1440](screenshots/final/projects-1440.png)     | 4/4          |
| Вакансии         | [390](screenshots/final/vacancies-390.png)    | [1440](screenshots/final/vacancies-1440.png)    | 4/4          |
| Программы        | [390](screenshots/final/programs-390.png)     | [1440](screenshots/final/programs-1440.png)     | 4/4          |
| Курсы            | [390](screenshots/final/courses-390.png)      | [1440](screenshots/final/courses-1440.png)      | 4/4          |
| Профиль          | [390](screenshots/final/profile-390.png)      | [1440](screenshots/final/profile-1440.png)      | 4/4          |
| Редактор профиля | [390](screenshots/final/profile-edit-390.png) | [1440](screenshots/final/profile-edit-1440.png) | 4/4          |
| Onboarding 0     | [390](screenshots/final/onboarding-0-390.png) | [1440](screenshots/final/onboarding-0-1440.png) | 4/4          |
| Onboarding 1     | [390](screenshots/final/onboarding-1-390.png) | [1440](screenshots/final/onboarding-1-1440.png) | 4/4          |

## Состояния

Визуально просмотрены screenshots состояний на 320/1440 px. Все состояния также проверены автоматически на 390/768 px.

| Состояние              | Проверенное поведение                                                                                            | Результат | Mobile / Desktop                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| Loading страницы       | Задержан GET аналитики: видны текст загрузки и skeleton                                                          | 4/4       | [320](screenshots/final/loading-page-320.png) / [1440](screenshots/final/loading-page-1440.png)                   |
| Loading действия       | Задержана отправка ответа курса: индикатор, disabled, aria-busy, повторный запрос блокируется                    | 4/4       | [320](screenshots/final/loading-action-320.png) / [1440](screenshots/final/loading-action-1440.png)               |
| Empty                  | Пустой список вакансий: прежний текст и действие сброса фильтров                                                 | 4/4       | [320](screenshots/final/empty-320.png) / [1440](screenshots/final/empty-1440.png)                                 |
| Error                  | Искусственный HTTP 500 аналитики: role=alert, сообщение, «Повторить» восстанавливает данные                      | 4/4       | [320](screenshots/final/error-320.png) / [1440](screenshots/final/error-1440.png)                                 |
| Disabled действия      | Пустой ответ курса: отправка и фокус native disabled кнопки блокируются                                          | 4/4       | [320](screenshots/final/disabled-action-320.png) / [1440](screenshots/final/disabled-action-1440.png)             |
| Disabled фильтра       | Недоступное «образование» в ленте: disabled, нажатие не меняет маршрут                                           | 4/4       | [320](screenshots/final/disabled-filter-320.png) / [1440](screenshots/final/disabled-filter-1440.png)             |
| Validation регистрации | Пустые обязательные поля при принятых соглашениях: error border/icons, сообщение, нет POST создания пользователя | 4/4       | [320](screenshots/final/validation-register-320.png) / [1440](screenshots/final/validation-register-1440.png)     |
| Validation onboarding  | Отсутствует обязательное фото: сообщение у поля, нет PATCH и перехода на следующий шаг                           | 4/4       | [320](screenshots/final/validation-onboarding-320.png) / [1440](screenshots/final/validation-onboarding-1440.png) |

Найдено и исправлено до merge: desktop-отступ регистрации исчезал, поскольку правило `:has(app-login)` совпадало и с RegisterComponent (его прежний selector также `app-login`). CSS-условие уточнено до `:has(.login)`. Регистрация снова имеет отступ 200 px; это проверено assertion и финальным screenshot. Правила регистрации, selector компонента и submit handler не изменены. После исправления весь финальный сценарий 64/64 выполнен повторно.

## Бизнес-логика

UI Kit сохраняет бизнес-правила, API/DTO, доменные use cases, права, router declarations и обработчики отправки форм. [business-boundary.json](business-boundary.json) фиксирует сравнение `bc4940c5..74a94c9b`: **284 UI-исходника, 0 изменений защищённых слоёв**. AST-сравнение существующих методов выявило 7 классов; они вручную проверены как keyboard/disabled guards, делегирование прежних events и объединение дублирующих presentation-реализаций. Дополнительная финальная правка изменяет только CSS auth; полный UI-аудит теперь содержит 285 исходников, по-прежнему 80 HTML-шаблонов.

Весь PR включает предыдущий responsive-коммит `bc4940c5`. В нём есть две правки исполняемой инициализации onboarding, которые нельзя скрывать под формулировкой «во всём PR нет изменений вне presentation»:

- `onboarding-stage-zero-info.service.ts`: профиль загружается до заполнения формы, draft сохраняется, fallback берётся из профиля.
- `onboarding-stage-one-ui-info.service.ts`: заполнение формы использует `emitEvent: false`, предотвращая повторную публикацию draft при инициализации.

Обе правки покрыты regression tests. Контракты, права, валидаторы и бизнес-действия сохранены. Полный список 80 мигрированных шаблонов и изменённых shared-компонентов находится непосредственно в [описании PR](PR.md).

## Дополнительные проверки и ограничения

Production build и development build (`build:pr`) после CSS-fix успешны: [final-build-prod.log](final-build-prod.log), [final-build-dev.log](final-build-dev.log). Prettier — 0 нарушений: [final-format.log](final-format.log). Проверка на Windows использует `--end-of-line auto --ignore-path .gitignore --ignore-path .prettierignore`, чтобы учесть checkout CRLF и локальный ignored dist; GitHub Linux checkout содержит LF и выполняет штатный `npm run format:check` до сборки. Основной [отчёт](REPORT.md) содержит результаты полного Vitest (2002/406), targeted tests (30), ESLint/Stylelint, 912 измерений, 24 пользовательских запусков и 36 проверок геометрии. Финальная правка меняет только селектор CSS; проверки затронутой регистрации повторены в указанной выше матрице.

Некоторые внешние изображения fixtures недоступны в обеих сравниваемых версиях; проверка не подтверждает реальные медиа/данные backend. Проверка auth/provider/permissions с настоящим аккаунтом и поведение системной клавиатуры/pickers требуют dev-стенда и устройств. Прежние Sass/CommonJS/budget warnings не устранены этим этапом.

**После merge:** дождаться успешного deploy merge SHA в dev, затем выполнить [IOS-ANDROID-SMOKE.md](IOS-ANDROID-SMOKE.md) на реальных iOS Safari и Android Chrome. Физический smoke-test пока не выполнен; доступ к устройствам/сервису, точный frontend URL и тестовый аккаунт не предоставлены. Найденные после merge проблемы исправлять отдельными PR в dev. Перед prod этот пункт должен быть успешно завершён; унификация до этого не считается полностью закрытой.
