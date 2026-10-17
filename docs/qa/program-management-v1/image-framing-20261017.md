<!-- @format -->

# Настройка кадра программы и мобильная обложка

## Current / target

Организатор уже видит draft шапки и логотипа в preview desktop/mobile. Сейчас оба
режима используют один cover, object-fit cover/center; кадр и масштаб не редактируются.
Новый запрос напрямую расширяет существующий preview: изображение внутри кадра
можно двигать и масштабировать, мобильной обложке нужен отдельный файл.

Сохраняем Mont, DS buttons/fields, существующую форму и preview. Под переключателем
экрана — выбор «Обложка / Логотип», ползунок «Масштаб», кнопки точного сдвига и
«Сбросить кадр». Выбранное изображение можно перетаскивать мышью/пальцем и двигать
клавиатурой. Масштаб 100–300%; область кадра и положение круглого логотипа фиксированы.
Не добавляем отдельный modal или autosave. Это прямо запрошенная локальная итерация
существующего принятого UI; отдельное утверждение нового экрана не требуется.

Исходные файлы сохраняются. Настройки кадра — отдельно для desktop cover, mobile
cover и общий круг logo. Мобильная обложка необязательна: без неё берём основной
файл, но разрешаем отдельный мобильный кадр. Новая загрузка/удаление сбрасывают
соответствующий кадр. Если заменён основной файл и mobile использует fallback,
сбрасывается и мобильный кадр. Save и cancel сохраняют существующий lifecycle/409.

## Contract / roles

- Django PartnerProgram: nullable `mobile_cover_image_address`; JSON `image_framing`,
  default `{}`. Новая additive migration0020; legacy выглядит как прежде.
- JSON `{cover:{x:50,y:50,zoom:1},mobile_cover:{...},logo:{...}}`;
  x/y — положение в диапазоне0–100, zoom1–3. Сохраняем полный объект либо `{}` для
  reset. Строгая валидация формы/ключей, конечные числа, запрет boolean/string/null.
- Existing PATCH `/programs/:id/management/settings/basic/`: оба новых поля optional,
  остальной payload/expected_updated_at/atomic lock/permissions unchanged.
- GET management и public/member detail возвращают новые поля. List возвращает
  `image_framing`, чтобы logo в списках/сайдбаре имел тот же кадр. Старые клиенты
  игнорируют additive поля; frontend tolerates missing fields.
- Только текущие manager/staff по существующему can_manage_program меняют настройки;
  anonymous/member/expert/чужой manager не получают write доступ.
- Сначала backend + migration на dev, затем frontend. Production вне scope.

## Acceptance criteria

| AC  | Наблюдаемый результат                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Desktop/mobile cover и logo сдвигаются drag/keyboard/buttons, масштабируются100–300%, без пустых краёв и смены размера кадра     |
| F2  | Новый mobile файл используется только на телефоне; без него — основной cover с независимым mobile кадром                         |
| F3  | Draft меняется до Save; после Save/reload реальные header и program logos повторяют crop; cancel восстанавливает сохранённое     |
| F4  | Replace/remove/reset корректно сбрасывают кадр, failed upload и409 не теряют draft; mode/target не dirty-ят форму                |
| F5  | Server rejects malformed/non-finite/out-of-range/unknown data атомарно; permissions иoptimistic lock действуют для новых полей   |
| F6  | Legacy программы и profile/project avatars выглядят как прежде; no horizontal overflow, touch/keyboard usable, busy/error guards |

## Plan / verification

1. API model/migration/strict serializer/read contracts; PostgreSQL targeted tests,
   public/member/list compatibility, permissions/stale/invalid payload.
2. Shared framing rendering primitive; opt-in Avatar framing, program Detail cover
   and all existing program logo consumers. Unit regressions and Angular build.
3. Management draft control + mobile upload + preview drag/range/keyboard/reset;
   preserve saving/cancel/guards. DOM integration + geometry tests.
4. Isolated Chrome against real local Django/PostgreSQL; mouse/touch, both sources,
   save/reload/cancel/409/failure, actual-vs-preview framing and narrow viewport.
5. Requirement audit/code review; separate dev PRs, backend-first rollout/full CI,
   live release smoke. Record real evidence and limitations below.

## Evidence

Review **PASS**: блокирующих замечаний нет. Проверены runtime diff, новые файлы,
API compatibility и opt-in Avatar rendering; исходники не переписываются.

| AC  | Evidence                                                                                                                                                         | Verdict |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| F1  | Chrome mouse и native CDP touch; keyboard slider/Shift+arrows, unit clamps/reset/busy; кадр fixed/clipped, positions bounded                                     | PASS    |
| F2  | Реальный local multipart mobile upload, независимые transform и URL; fallback проверен до/после удаления                                                         | PASS    |
| F3  | Local API не менялся до Save; Save/reload и точное совпадение computed framing, размеров, natural dimensions, источников с actual header в1440/360; sidebar logo | PASS    |
| F4  | DOM upload/reset tests; browser cancel/failed upload413/concurrent PATCH409 без потери draft; toggles pristine                                                   | PASS    |
| F5  | 48 API tests на local PostgreSQL, включая5 новых; invalid/finite/range/huge int/roles/stale/atomic update; final framing5PASS                                    | PASS    |
| F6  | Legacy Avatar/profile/project tests и source diff; mobile360/390 оба режима без overflow; page errors0; новые controls44px                                       | PASS    |

- Angular targeted tests/build/ESLint/Stylelint/format: результаты и full CI в PR.
- Local Django migration0020 применена; makemigrations --check — no changes.
  -7 browser scenarios PASS на реальных local Django/PostgreSQL. Только внешний
  object storage заменён local adapter. Один harness retry: native output также
  имеет role=status, поэтому ожидание upload уточнено до p[role=status].
- Новый hint использует существующий token black для читаемого текста; Mont,
  button foundation, spacing/radius и существующий preview сохранены.

[Desktop](image-framing-20261017/desktop.png), [mobile](image-framing-20261017/mobile.png),
[geometry/browser evidence](image-framing-20261017/browser-qa.json).

Not checked: физический телефон, OS screen reader, Selectel upload transport,
live organizer session. Native touch input проверен через Chrome CDP.
Backend PR [782](https://github.com/PROCOLLAB-github/api/pull/782); только dev rollout,
сначала API/migration, затем Angular. Live release checks будут в PR после deployment.
