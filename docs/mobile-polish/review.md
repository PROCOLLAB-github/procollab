<!-- @format -->

# Requirement audit и review

Base: `origin/dev` / `ec57fa7cadb8ca7acef6859380a966a837783495` (merged PR #401). Head: `fix/dev-mobile-ui-composition`. Scope: 12 замечаний пользователя и выбранная им светлая шапка. Review выполнен в текущей задаче по `procollab-review`, PR оформлен по `procollab-pr`; отдельный агент не использовался.

| AC  | Реализация                                                                 | Evidence                                                                        | Verdict |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------- |
| 1   | `Nav.routeTitle`, initial URL, NavigationEnd + защита от позднего navTitle | Прямое открытие ленты/профиля; program → feed → profile SPA                     | PASS    |
| 2   | `FeedFilter` grid, static icon                                             | Проверка непересечения icon/label/count, screenshots 320/390                    | PASS    |
| 3   | Удалён dropdown; прежний `setFilter`                                       | Один набор 6 категорий, includes=vacancy и API type=vacancy, disabled education | PASS    |
| 4   | Общий `VacancySkills`, переносы                                            | Видимость полного текста; native expand, все 4 навыка; unit integration         | PASS    |
| 5   | `InfoCard`, grids, token 260 px                                            | Измерение ширины и visual dashboard/my/projects                                 | PASS    |
| 6   | `Projects` responsive order, `ProjectActivityCard` 2×2                     | Activity выше outlet, полная ширина контейнера; desktop screenshot              | PASS    |
| 7   | `MemberCard`, `Members` grid                                               | Ширина ≤260, навык переносится, CTA внутри; visual + overflow                   | PASS    |
| 8   | `ProgramCard` avatar 64, dates/region отдельно                             | Полная строка geography, scrollWidth≤clientWidth, 6 widths                      | PASS    |
| 9   | Общий `Detail`, PageHeader, подписанные контакты/положение                 | Program screenshot, native disabled contacts, равные secondary columns          | PASS    |
| 10  | `Detail` action grid без divider cells                                     | Profile buttons геометрия и visual 320/390                                      | PASS    |
| 11  | `Detail` + `ProjectsLeftSide` width                                        | Project actions и metadata: полная mobile width                                 | PASS    |
| 12  | `Office`/`Nav` symmetric grid + surface                                    | Центры title/header совпадают, neutral background, 44 px targets, Escape/focus  | PASS    |

Checked by source: просмотрен diff относительно dev; call chains setFilter/logout/contacts/materials/roles сохранены. Нет изменений защищённых бизнес-слоёв/API. Существующий wrapper Button и директивы UIKit остаются canonical; новый card/control implementation не добавлен. Shared consumers проверены через экранные и state сценарии. Desktop sidebar и ограничения ролей сохранены.

Checked by tests/build: 2006 regression tests, повтор 41 InfoCard tests после изменения textContent, production build, ESLint, Stylelint, Prettier. Полные команды/логи в [README](README.md).

Checked in browser: 48 geometry screens + 18 interaction scenarios + 48 section/state checks. Просмотрены mobile list/detail/feed screens на 320/390 px, tablet projects и desktop, а также loading/empty/error/validation screenshots. Читаемость проверена на длинных строках; поля/кнопки не уходят за viewport. Навигация использует native keyboard controls и drawer focus return. Метрики активности не интерактивные, их CSS order не добавляет tab stops.

Во время review исправлены пустой заголовок при первом открытии, слишком тесные категории на 320 px, intrinsic width вложенных action buttons и перехват клика пустым snackbar на tablet. Пробелы шаблона InfoCard и асинхронное ожидание DOM в проверках исправлены; итоговые прогоны успешные. Незакрытых BLOCKER/MAJOR в рамках указанных 12 AC нет.

Not checked: реальные устройства/аккаунты dev, screen reader, полное WCAG соответствие. Эти ограничения явно перечислены в PR. Smoke-test на физических iOS/Android выполняется после merge в dev перед prod; он не отмечен пройденным.

Verdict: готово к review и merge в dev после завершённых локальных проверок; production acceptance остаётся отдельным этапом.
