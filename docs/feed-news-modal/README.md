<!-- @format -->

# Компактная лента и модальное чтение новости

База DEV после #373: `e2c6d00dded1e026a9ec2850612ea8822f75e9e3`.
Ветка: `fix/dev-feed-news-modal`. Проверка 23–24 сентября 2026, Node 20.20.2.

## Изменения и границы

- Для `feedType=project/people` NewsCard делегирует превью локальному FeedNewsPreviewComponent. Полное чтение реализует соседний FeedNewsModalComponent поверх существующего app-modal. Shared modal не изменён.
- Превью: заголовок до двух строк, описание до трёх, thumbnail 120 × 67,5 px. Без изображения media-элемента нет. «Подробнее» появляется по фактическому DOM-обрезанию после layout, изменения ширины или загрузки шрифта. В превью ссылки текста не создают скрытых при clamp tab-stop; в окне сохранены ParseLinksPipe/ParseBreaksPipe.
- Мышь, Enter и Space открывают окно. Like, copy, source, CTA и owner menu остаются самостоятельными действиями. После закрытия через крестик, Escape или backdrop фокус возвращается на trigger. Focus trap включается при attachment portal; уничтожение владельца до отложенного attachment не оставляет overlay.
- Окно получает тот же FeedNews input; события лайка возвращаются через NewsCard → существующий facade → FeedUIInfoService. Копирование вызывает прежний onCopyLink. Открытие не делает detail HTTP и не добавляет просмотры. IntersectionObserver/read flow не изменены.
- Полный текст не обрезается; файлы доступны как download-ссылки. Пять изображений проверены в существующей карусели с локальным `fit=contain`. Исправлен её существующий дефект: `images.length` читал длину функции signal, теперь `images().length` читает число изображений. Default `cover` для прежних поверхностей сохранён.
- Общие 420 px заменены высотой содержимого; CSS Grid растягивает только соседей одного ряда. CTA выровнены по низу ряда. Порядок 1–6, append 7–12 и breakpoint 1000 px сохранены.
- Новые проекты и вакансии не получают modal, сохраняют CTA и маршруты. Legacy detail/profile NewsCard и редактор не переработаны.
- Backend, React, API-контракт, runtime API-слой, category counts, пагинация, фильтры, зависимости, workflows и test harness не изменены. В API-каталоге добавлен только regression spec существующего UI state.

## Реальные замеры браузера

Это настоящие Angular-компоненты FeedComponent/NewsCard/Modal в локальном fixture, со стилями office и синтетическими данными. Сеть/fetch заменены fixture-facade; лайк использует настоящий FeedUIInfoService. Live DEV и реальные пользовательские данные не использовались.

Масштаб 100%; одинаковые fixture и viewport для before/after. Исходная сборка сделана до правок от exact base. Полные DOM-замеры: [geometry.json](geometry.json).

| Viewport   | Колонки | Ширина карточки | Высота рядов после                     | До         |
| ---------- | ------- | --------------- | -------------------------------------- | ---------- |
| 1440 × 900 | 2       | 423,33 px       | 266,5 / 314 / 358 px                   | все 420 px |
| 1280 × 900 | 2       | 423,33 px       | 266,5 / 314 / 358 px                   | —          |
| 1024 × 900 | 2       | 368,75 px       | 266,5 / 336 / 358 px                   | —          |
| 390 × 844  | 1       | 375 px          | 221 / 266,5 / 314 / 290 / 258 / 358 px | все 420 px |

На desktop разница высот и Y-позиций CTA внутри каждого ряда — 0 px. Следующие ряды имеют свою высоту. Thumbnail во всех viewport — 120 × 67,5 px, `cover`; no-image карточка не резервирует media-slot. Очень длинный текст без пробелов и 80 абзацев также не создаёт горизонтального переполнения; на desktop ряды 327 / 336 / 358 px.

Окно: `width: min(880px, calc(100vw - 24px))`, `max-height: 90dvh`. При 1440/1280/1024 × 900 максимум 880 × 810 px. При 390 × 844 — 366 × 759,59 px. В desktop окружении браузер использует классическую полосу прокрутки 15 px, поэтому визуальный отступ от полезной области может отличаться от 12 px. Прокручивается содержимое, header не уезжает. На mobile длинная новость прокручена до `scrollTop=7334`, крестик сохранил Y=52,20 px.

| Изображение | Исходный размер | Видимая область изображения при 1440 × 900 |
| ----------- | --------------- | ------------------------------------------ |
| Портрет     | 600 × 900       | 408 × 612                                  |
| Квадрат     | 600 × 600       | 612 × 612                                  |
| 4:3         | 800 × 600       | 816 × 612                                  |
| 16:9        | 960 × 540       | 840 × 472,5                                |
| Панорама    | 1500 × 300      | 840 × 168                                  |

У всех `object-fit: contain`, вся рамка fixture видима. Это размеры отрисованного изображения, вычисленные из natural size и contain; CSS-бокс может включать свободное место по бокам. На mobile портрет — 319 × 478,5 px. Обрезки нет. Проверено переключение всех пяти изображений стрелками.

В браузере дополнительно проверены Space, «Подробнее», thumbnail, Escape/крестик, возврат фокуса и синхронный лайк (234 → 233 на обеих поверхностях). Внутренние действия/owner menu/append/закрытие backdrop также проверены targeted-тестами. Скачивание внешнего файла и доступность целевой detail-страницы на live DEV не проверялись; в fixture проверены download-атрибуты и существующие маршруты. Clipboard click делегирован прежнему обработчику, содержимое системного буфера браузерной приёмкой не подтверждено.

В browser log нет errors; есть NG0912 IconComponent collision на исходной и итоговой fixture. [Журнал](browser-log.json).

## Скриншоты

Пары A (короткие без/с изображением), B (длинная новость + вакансия), C (новый проект + новость с изображением) находятся в рядах 1, 2, 3 общего скриншота.

- [Лента до](screenshots/feed-before.png) / [после, все три ряда](screenshots/feed-after.png).
- [1280](screenshots/feed-1280.png), [1024](screenshots/feed-1024.png), [экстремально длинный текст](screenshots/feed-extreme.png).
- [Mobile до](screenshots/mobile-before.png) / [после](screenshots/mobile-after.png), [mobile extreme](screenshots/mobile-extreme.png).
- [Портрет](screenshots/modal-portrait.png), [квадрат](screenshots/modal-square.png), [4:3](screenshots/modal-landscape.png), [16:9](screenshots/modal-wide.png), [панорама](screenshots/modal-panorama.png).
- [Полный текст](screenshots/modal-long-text.png), [длинный текст + landscape, конец](screenshots/modal-long-landscape.png).
- [Mobile modal](screenshots/mobile-modal.png), [длинный текст + portrait, начало](screenshots/mobile-modal-long-top.png) / [конец](screenshots/mobile-modal-long-bottom.png).

## Воспроизведение fixture

Сохранены тестовые SVG в `fixtures/` и entry point `visual-fixture.ts`. Он использует только локальные синтетические новости. Для повторения скопировать entry point в `tmp/surface-main.ts` (его относительные imports рассчитаны на tmp), создать временный tsconfig от корневого tsconfig с `files: ["surface-main.ts"]`, подключить обычный Angular index и собрать development с CLI overrides `--browser tmp/surface-main.ts --ts-config tmp/surface-tsconfig.json --output-path tmp/preview-after`. Скопировать SVG в `browser/fixtures`, создать произвольный тестовый `fixtures/notes.txt`, обслужить `browser` локальным SPA-сервером. Адрес `/office/feed`; `?extreme` включает длинные тексты, `?odd` оставляет пять карточек. Production bootstrap, маршруты и конфигурация сборки не меняются.

Результаты команд сохранены отдельно в [checks.md](checks.md).
