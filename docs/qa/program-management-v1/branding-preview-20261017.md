<!-- @format -->

# Предпросмотр шапки и логотипа

## Запрос и дизайн

Организатор проверяет, что обрежется на компьютере и телефоне, до сохранения программы.
Локальная итерация существующего раздела оформления, прямо запрошенная пользователем.
Под двумя загрузчиками — переключатель «Компьютер / Телефон» и один крупный preview.
Для компьютера используется шапка шириной 866.67 px (экран 1440), для телефона —
328 px (экран 360). Canvas равномерно уменьшается до доступной ширины; crop остаётся
таким же, как на странице. Сохраняются Mont, кнопки DS и ритм текущей формы.

Сейчас видны только исходники до 160×100, поэтому кадрирование и перекрытие не видны.
Измерено на текущем Detail: desktop cover 866.66×155, logo 123×123, left371.83/top88.5;
mobile cover328×136, logo105×105, left16/top63. Object-fit cover и центрирование.

## Scope / план

- Preview читает draft controls `coverImageAddress`/`imageAddress`; загрузка в FileService
  остаётся прежней, обновление после её успеха. Во время загрузки виден статус.
- Замена/удаление/сброс формы обновляют preview. Переключатель не отправляет форму.
- Страница и preview используют общие mixin геометрии и размеры логотипа.
  Native img в preview позволяет фиксировать device layout независимо от viewport
  редактора; это приватное изображение canvas, а не новая реализация DS Avatar.
- Для отсутствующих изображений используются те же defaults, что на странице.
- Ошибки загрузки самого preview показаны явно, без очистки draft URL.
- Текст баннера: рекомендуемая ширина1800 px; высоту можно выбрать любую,
  баннер показывается целиком и не обрезается. API/validators не меняются.
- Репозиторий Angular; backend, роли, permissions и сохранение изображений не меняются.
  Редактор кадрирования, перемещение фокуса и mobile-specific файлы вне scope.

## Acceptance criteria

- P1: до Save preview использует новые draft images, а программа на API остаётся прежней.
- P2: desktop/mobile имеют crop, круг логотипа и перекрытие как на реальной странице;
  оба режима доступны при любой ширине редактора. Существующая страница визуально сохраняется.
- P3: clear/reset дают актуальные defaults; failed upload сохраняет прежние изображения.
- P4: переключатель доступен с клавиатуры, не сохраняет/не dirty-ит форму;
  responsive canvas не создаёт overflow. ResizeObserver очищается при уничтожении.
- P5: preview busy/error понятны; ошибка изображения не меняет данные формы.
- P6: фраза «Высота — по содержимому» заменена понятным пояснением.

## Verification / review

Review: **PASS**, блокирующих замечаний нет. Проверены итоговый diff и новые файлы.

| AC  | Evidence                                                                                                                                              | Verdict |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| P1  | DOM integration + real local Django multipart upload; draft URL обновился, GET management сохранил прежние cover/logo/updated_at                      | PASS    |
| P2  | Chrome: actual header vs preview в обоих режимах при ширине редактора1440/360; геометрия и crop отличаются менее0.15px, object-fit/position совпадают | PASS    |
| P3  | Browser clear → defaults, cancel → saved URLs, failed upload413 сохраняет прежний draft                                                               | PASS    |
| P4  | Keyboard Tab/Enter переключает режим без submit/dirty; оба режима без overflow360px; unit ResizeObserver disconnect                                   | PASS    |
| P5  | Busy при реальной локальной загрузке; image error alert сохраняет URL, замена/успех сбрасывают ошибку                                                 | PASS    |
| P6  | DOM/browser: новая понятная фраза; исходной фразы нет                                                                                                 | PASS    |

- Targeted Vitest: **31 PASS /4 files** — management DOM/save, preview, Detail и canonical Avatar.
- Development build, scoped ESLint, Stylelint, Prettier и diff whitespace check: **PASS**.
- Isolated Chrome + real local Django/PostgreSQL: **6 browser scenarios PASS**, page errors0.
- Shared Sass geometry/defaults/sizes сохраняют действующую страницу; profile/project размеры110/105 сохранены. Permissions, API payload, upload/save pipeline и backend не менялись.
- Использованы существующие Mont, button directive/foundation и color tokens; приватный image canvas позволяет принудительно показать оба экрана независимо от viewport редактора.

[Desktop](branding-preview-20261017/desktop.png), [mobile](branding-preview-20261017/mobile.png), [browser measurements](branding-preview-20261017/browser-qa.json).

Upload storage заменён только в изолированном local adapter; auth/multipart/UserFile/API настоящие, local PostgreSQL. Selectel transport, физический телефон и OS screen reader не проверены. Live organizer session недоступна; live release smoke будет указан в PR после dev deploy. Миграции не нужны.

QA harness сначала исправлен: подтверждение отмены использует существующее «Выйти без сохранения»; повторный mock upload должен получать уникальное имя файла из-за PK UserFile.link. Эти два сбоя относились к harness/fixture, runtime diff не менялся.
