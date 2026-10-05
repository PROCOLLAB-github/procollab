<!-- @format -->

# Requirement audit и review

Scope: восстановить desktop `dev` до #401 и сохранить адаптив из #403.
Review выполнен в текущей задаче по `procollab-review`, PR preparation — по `procollab-pr`.
Visual reference задан пользователем; новое продуктовое/design решение не вводилось.

| AC                                         | Реализация / evidence                                                                    | Verdict                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Desktop ≥1000 сохраняет прежнюю композицию | Scoped styles и legacy fragments; 36 exact pixel comparisons с `5fe4d5c6`                | PASS                                    |
| Приоритетные разделы и shared Button/Card  | 14 экранов + 3 empty states + loading action на 1440/1920; [сравнение](README.md)        | PASS                                    |
| Pixel regression обязателен                | `compare.py --check`: размер + exact RGB; reference repeat и after: 36/36, 0 pixels      | PASS                                    |
| Mobile/tablet сохраняется                  | 42 exact comparisons с `1138fe0c` на 320/390/768; 48 states, 18 interactions             | PASS                                    |
| Breakpoint не сбрасывает текущую страницу  | 6 resize checks: same DOM roots, search value, route/filter query сохранены              | PASS                                    |
| API/permissions/business rules сохранены   | Нет diff в API/domain/infrastructure, DTO, routes, dependencies; прежние handlers/guards | PASS by source + unit/integration tests |

## Checked by source

- Media boundary `<1000px` и desktop legacy values, canonical Button/Avatar/Icon consumers.
- Presentation service не содержит domain/API решений. Корни router/search/forms не дублируются.
- Имеющиеся role conditions и handlers сохранены в обеих presentation-ветках.
- Forms/CVA, save/autosave services, HTTP contracts, IDs, server-owned permissions и deadlines не менялись.
- `git diff --exit-code origin/dev -- projects/social_platform/src/app/api projects/social_platform/src/app/domain projects/social_platform/src/app/infrastructure package.json package-lock.json angular.json` — пустой diff.
- Дополнительно восстановлена desktop ширина 605 px двух информационных диалогов редактора проекта.

## Checked by tests / build

- `npm run test:ci`: 2006 tests, 406 files. Runner по-прежнему исключает
  `projects.component.spec.ts`, `program.component.spec.ts`, `editor-submit-button.directive.spec.ts`.
- Placement regression проверяет условия размещения activity через Angular template AST.
- `npm run build:social:prod`: успешная компиляция TypeScript/templates/styles, budgets сохранены.
- `npm run lint:ts`: 0 errors, 6 прежних warnings. SCSS проверен на изменённых файлах.

## Checked in browser

- Windows / installed Chrome / одинаковые fixture responses и browser context.
- Desktop reference repeat, before/after, mobile before/after: strict pixel equality, без masks.
- Loading page/action, pending action без повторного запроса, empty, HTTP 500/retry,
  disabled controls и validation регистрации/onboarding: [48 checks](states.json).
- Центр мобильной шапки, drawer route transition/Escape/focus return, notifications с клавиатуры,
  filter query/request, полные навыки, карточки и Detail actions: [18 checks](interactions.json).
- Поиск/фильтр после resize: [6 checks](resize.json).

## Findings и устранение

- MAJOR: общие UI Kit геометрия/типографика меняли desktop consumers. Ограничены mobile,
  прежние desktop styles/markup восстановлены; exact comparisons проходят.
- MAJOR: shared Tabs заменили прежнюю desktop step navigation. Legacy desktop markup восстановлен,
  оба редактора включены в pixel comparison.
- MINOR: медиа-обёртка изменила CSS cascade полей и их mobile padding. Сохранён исходный
  каскад responsive controls, повторные сравнения editor ширин проходят.
- Test harness: Escape отправлялся до появления drawer и захвата фокуса. Теперь проверка ждёт
  реальный dialog/focus, затем проверяет закрытие и возврат фокуса; assertions не ослаблены.

Нерешённых actionable findings в проверенном scope нет.

## Not checked / limits

- Реальные iOS/Android на dev и production. Device smoke-test после merge остаётся обязательным.
- Live backend данные и полный role matrix; server permissions не изменялись и заново не аудировались.
- Каждый скрытый scroll section, popup и возможный async state не покрыт pixel screenshots.
  Desktop pixel states: empty feed/vacancies/courses и loading action; остальные error/disabled/validation покрыты mobile state checks.
- Onboarding desktop не входит в набор desktop pixel goldens; его прежняя геометрия восстановлена по source.

Verdict: READY TO MERGE INTO DEV для реализации. Dev acceptance и физический device smoke-test
требуются после merge перед production handoff.
