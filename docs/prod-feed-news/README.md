<!-- @format -->

# Браузерная приёмка PROD-порта новостной ленты

## Контекст

Проверено 24 сентября 2026 года в локальном Chromium на итоговой рабочей копии selective semantic port в ветке `codex/prod-news-feed-angular`.

- PROD base: `8f0202ab0937965bb548a93ca32c7fc6ff0e9242` (`origin/master`).
- Финальный DEV source: `bdb5cf4780be0daa3e441d6b152511fcbe638d4e` после #375.
- Источники Angular: #372 `d4708cbc…`, #373 `e2c6d00d…`, #374 `75f206da…`, #375 `bdb5cf47…`.
- Browser: Chrome 153.0.8010.53, viewport scale 100%, `devicePixelRatio=1`.
- На момент приёмки port оставался незакоммиченным согласно ограничению задачи; merge и deploy не выполнялись.

Итог: **browser acceptance GREEN с перечисленными ниже границами локального fixture**.

## Как устроена проверка

В игнорируемом `tmp/` собран отдельный Angular entry point на основе финального DEV fixture. В нём работают настоящие `FeedComponent`, `FeedInfoService`, `FeedFilter`, четыре вида карточек, `NewsCard`, carousel и modal из текущего PROD-порта. Сеть заменена локальными use case с 12 синтетическими элементами; runtime/config/workflows/dependencies приложения не менялись.

Первая страница содержит:

1. короткую новость человека без изображения;
2. короткую новость с пятью изображениями;
3. длинную новость проекта без изображения;
4. вакансию;
5. новый проект;
6. новость проекта с изображением и файлом.

Вторая страница содержит ещё шесть элементов с уникальными составными ключами. Для modal использованы локальные SVG `600×900`, `600×600`, `800×600`, `960×540` и `1500×300`.

Fixture использует один внутренний scrollbar office-shell. Дополнительный зарезервированный gutter документа отключён только в локальном harness, чтобы не создавать искусственный второй scrollbar; production CSS не менялся.

## Viewport и сетка

| Viewport            | Колонки | Ширина карточки, px | Высоты карточек/рядов, px           | Horizontal overflow |
| ------------------- | ------: | ------------------: | ----------------------------------- | ------------------: |
| 1440 × 900          |       2 |             423,328 | 267,5 / 308 / 350                   |                   0 |
| 1280 × 900          |       2 |             423,328 | 267,5 / 308 / 350                   |                   0 |
| 1024 × 900          |       2 |              368,75 | 267,5 / 328 / 350                   |                   0 |
| 390 × 844           |       1 |                 375 | 222 / 267,5 / 306 / 326 / 276 / 350 |                   0 |
| 1440 × 900, extreme |       2 |             423,328 | 328 / 348 / 350                     |                   0 |

На desktop разница высот и Y-позиций CTA внутри каждого CSS Grid row равна `0 px`. Следующие ряды имеют собственную высоту: глобальная высота `420px` не вернулась. Порядок DOM остаётся построчным `1 2 / 3 4 / 5 6`.

Thumbnail на всех четырёх ширинах — `120 × 67,5 px`, `object-fit: cover`. Короткая новость без изображения не создаёт media-slot и не показывает «Подробнее»; длинная новость показывает кнопку по фактическому DOM-обрезанию.

Сырые координаты карточек, CTA, фильтров, thumbnail и мета-строк находятся в [geometry.json](geometry.json).

## Фильтры и counts

| Категория          | Count |
| ------------------ | ----: |
| Все новости        |    12 |
| Новости проектов   |     3 |
| Свежие вакансии    |     3 |
| Новости сообщества |     6 |
| Новости программ   |     0 |
| Образование        |     0 |

На 1440/1280/1024 все шесть чисел имеют одну Y-координату, `14px / 600`, line-height `18px`, tabular nums. На 390 px они совпадают внутри каждой двухколоночной строки. Открытое mobile-меню также проверено.

Клик «Новости сообщества»:

- ставит `aria-pressed=true` только выбранной кнопке;
- вызывает локальный feed use case с `offset=0`, `limit=6`, `type=news`;
- оставляет шесть элементов `news`;
- не меняет глобальные counts.

Standalone TestBed router не считается проверкой синхронизации production address bar: активное состояние, query stream и fetch проверены, но после синтетического одно-route перехода итоговый `location.search` пустой.

## Пагинация 6 → 12

До прокрутки в DOM находятся шесть элементов. Реальный обработчик `FeedInfoService.initScroll` после scroll-события вызвал:

```text
offset=6, limit=6, type=vacancy|project|news
```

После ответа в DOM 12 элементов. Первые шесть ключей сохранены без перестановки, новые добавлены в конец, все ключи уникальны. Horizontal overflow после append также равен `0`.

## News preview и нижняя мета-строка

- Badges и даты `23.09.2026` отображаются для четырёх типов.
- Industry проекта находится в верхней badge/meta-зоне; в footer её нет.
- Like/count и share находятся слева, views/count — справа.
- Все три иконки имеют `16 × 16 px`.
- Числа имеют `12px`, line-height `16px`, tabular nums.
- Максимальное расхождение центров элементов по вертикали — `0 px` в preview (`0,008 px` в modal из-за субпиксельного округления).
- Левая и правая группы имеют одинаковые геометрические inset `21 px` относительно внешней рамки карточки (`20 px` padding + `1 px` border).

Клики like, share, source и CTA не открывают modal. Для source/CTA в одно-route fixture подавлялась только фактическая навигация; card click-handler получил настоящий browser event. Owner dots невозможно показать через текущий `FeedComponent`, потому что global feed не передаёт `isOwner`; исключение owner menu из открытия modal остаётся покрыто component regression test.

## Modal и изображения

| Сценарий            | Modal body, px | Natural    | Видимый кадр, px | Fit     |
| ------------------- | -------------- | ---------- | ---------------- | ------- |
| Portrait, 1440      | 880 × 810      | 600 × 900  | 408 × 612        | contain |
| Square, 1440        | 880 × 810      | 600 × 600  | 612 × 612        | contain |
| Landscape 4:3, 1440 | 880 × 810      | 800 × 600  | 816 × 612        | contain |
| Wide 16:9, 1440     | 880 × 778,672  | 960 × 540  | 840 × 472,5      | contain |
| Panorama, 1440      | 880 × 474,172  | 1500 × 300 | 840 × 168        | contain |
| Portrait, 390       | 366 × 759,594  | 600 × 900  | 319 × 478,5      | contain |

Разница natural/painted aspect ratio во всех пяти случаях равна `0`; crop отсутствует. Стрелками последовательно проверены индексы `1/5`–`5/5`. Modal с файлом сохраняет `href=/fixtures/notes.txt` и `download="Описание проекта.txt"`.

Extreme mobile modal имеет `scrollHeight=8037`, `clientHeight=703`; в нижнем состоянии `scrollTop=7334`. Header и крестик сохраняют координаты (`header Y=42,203`, close Y=`52,203`) и не уезжают с содержимым.

## Интеракции

- Мышь по thumbnail открывает modal.
- «Подробнее» длинной новости без изображения открывает полный текст; у короткой новости кнопки нет.
- `Enter` и `Space` на карточке открывают modal.
- Escape, крестик и backdrop закрывают его.
- После каждого закрытия фокус возвращается на исходную карточку/кнопку.
- Like в preview: `234 / true → 233 / false`, modal не открывается.
- Like в modal: `234 / true → 233 / false` одновременно в modal и лежащем под ним preview; зафиксирован один вызов прежнего like flow.
- Share в preview и modal не открывает новое окно; локальная clipboard-заглушка получила ожидаемые feed URL.
- Открытие modal не вызвало feed/detail fetch: используется уже загруженный `FeedNews`.
- Console errors: `0`; console warnings: `0`.

## Скриншоты

Основная лента и размеры:

- [Вся лента 1440](screenshots/feed-all-1440.png)
- [Viewport 1440](screenshots/feed-1440.png)
- [Viewport 1280](screenshots/feed-1280.png)
- [Viewport 1024](screenshots/feed-1024.png)
- [Viewport 390](screenshots/feed-390.png)

Фильтры и карточки:

- [Фильтры 1440](screenshots/filters-1440.png)
- [Активный фильтр новостей](screenshots/filter-news-active.png)
- [Открытый mobile-фильтр](screenshots/filters-390-open.png)
- [Вакансия](screenshots/vacancy-1440.png)
- [Длинная новость](screenshots/long-news-1440.png)
- [Extreme long news](screenshots/long-news-extreme-1440.png)
- [Новость с изображением](screenshots/image-news-1440.png)

Пагинация:

- [До append: 6](screenshots/pagination-6.png)
- [После append: 12](screenshots/pagination-12.png)

Modal:

- [Portrait](screenshots/modal-portrait-1440.png)
- [Landscape](screenshots/modal-landscape-1440.png)
- [Пять изображений, индекс 5/5](screenshots/modal-multiple-images-1440.png)
- [Файл в modal](screenshots/modal-file-1440.png)
- [Mobile modal](screenshots/modal-390.png)
- [Mobile extreme, начало](screenshots/modal-390-long-top.png)
- [Mobile extreme, конец](screenshots/modal-390-long-bottom.png)

## Границы приёмки

- Live backend, авторизация, реальные данные и доступность целевых detail/profile routes не проверялись.
- Системный download не запускался; проверены DOM-атрибуты `href` и `download`.
- Запись в системный clipboard не выполнялась: локальная заглушка подтвердила вызов обработчика и сформированный URL.
- Owner menu не выводится самим global `FeedComponent`; его browser-сценарий объективно недоступен без изменения runtime-входов, поэтому он оставлен regression-тестам.
- Browser fixture — development build для визуальной проверки. Production build и test suites фиксируются отдельно в общем отчёте PR.

## Воспроизведение

Локальный harness остаётся только в игнорируемом `tmp/`. Использованные шаги:

```powershell
node_modules\.bin\ng.cmd build social_platform --configuration=development `
  --browser tmp/surface-main.ts `
  --ts-config tmp/surface-tsconfig.json `
  --index tmp/surface-index.html `
  --output-path tmp/preview

# Затем browser/ обслуживался локальным SPA-сервером на 127.0.0.1.
```

Runtime-код, Angular config, package manifests, test harness и workflows этой browser-проверкой не менялись.
