<!-- @format -->

# Проверка архива вакансий — 21.10.2026

Дизайн: [согласованный макет](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE/PROCOLLAB-Design-System-v1?node-id=776-5414).
Вкладки в Figma и Angular имеют высоту 27 px, без общей серой подложки.
Использованы существующие Card, Button, Modal, State, VacancySkills и VacancyStatus; Mont загружен в браузере.

## Выполненные проверки

| Уровень       | Evidence                                                                                                                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source        | UpdateVacancyUseCase → PATCH /vacancies/{id}/, DeleteVacancyUseCase → DELETE. Состояние списка меняется после успешного ответа; форма не сбрасывается при изменении соседней карточки.                                                                                                                                              |
| Angular tests | `npm run test:ci -- projects/social_platform/src/app/api/project/facades/edit/project-vacancy.service.spec.ts projects/social_platform/src/app/api/project/facades/edit/ui/project-vacancy-ui.service.spec.ts projects/social_platform/src/app/ui/widgets/vacancy-card/vacancy-card.component.spec.ts` — 3 файла, 46 тестов passed. |
| Build         | `npm run build:pr` — exit 0. Preview build с существующим entry point `docs/vacancy-redesign/preview/main.ts` — exit 0. Sass deprecation warnings относятся к существующим стилям.                                                                                                                                                  |
| Browser       | `node docs/vacancy-archive/browser-acceptance.cjs` с локальным preview на 4371 — 60 проверок, JS errors []. Ширины 1440/768/390/320; Mont; touch; tabs keyboard; модалки; счетчики; отмена; busy; повтор после ошибки; появление отклика перед удалением; пустые списки; объяснение отказа возврата в непубличном/черновом проекте. |
| Static        | ESLint измененных TS и Stylelint двух измененных SCSS — exit 0.                                                                                                                                                                                                                                                                     |
| API           | Связанная API-ветка от dev 1c424ff: `manage.py test vacancy.tests projects.tests.test_project_signals projects.tests.test_program_project_detail_access --noinput --keepdb` — 119 tests passed на PostgreSQL 18.1, Python 3.11.15 / Django 4.2.11. Models check и makemigrations --check --dry-run — exit 0; миграция vacancy.0011 проверена upgrade-тестом на старых записях. |

[Результаты браузера](browser-results.json), [desktop](archive-modal-1440.png), [mobile](archive-modal-390.png).
Browser использует fixtures и не выполняет мутации live API или отправку писем.

## Requirement audit

| AC  | Verdict                    | Evidence                                                                                                                                           |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | PASS                       | height=27, счетчики и фильтрация проверены в браузере на четырех ширинах; геометрия карточек на desktop — две колонки по 554 px в preview.         |
| AC2 | PASS                       | API-тест атомарного закрытия и уведомления ожидающих; browser проверяет ожидание ответа и успешный перенос.                                        |
| AC3 | PASS                       | Сервер отклоняет возобновление в draft/private проекте; история решений сохраняется. UI показывает причину из API и для строки, и для массива; browser проверяет отказ и повтор. |
| AC4 | PASS                       | Подтверждение и успешное удаление проверены API, unit и browser.                                                                                   |
| AC5 | PASS                       | API запрещает удаление во всех состояниях откликов и обеих вкладках; UI предлагает архив.                                                          |
| AC6 | PASS                       | Ошибка и повтор, защита двойного запроса, появление отклика после открытия модалки; invalid skills не закрывают вакансию и не удаляют навыки.      |
| AC7 | PASS в проверенном контуре | Empty, unknown count, 320/390, keyboard tabs, Escape и focus после переноса, сохранение формы проверены. Полный accessibility audit не выполнялся. |
| AC8 | PASS                       | API и signal tests: архив сохраняется при повторной публикации до ручного возврата; даты/решения сохранены. Новая вакансия черновика публикуется; миграция не меняет старые статусы/даты. |

## Review и внедрение

По итоговому diff проверены permissions, порядок блокировок Project → Vacancy → VacancyResponse,
сохранение response_count как числа ожидающих, отсутствие N+1 в каталоге, readonly total_response_count,
контекст проекта, server errors, Mont, фокус и отсутствие переполнения.
Кодовые замечания в проверенном контуре исправлены; связанный frontend/API diff требует совместного внедрения.

Пользователь подтвердил: «Оставлять архивные вакансии в архиве до ручного возврата».
Сервер отличает архив от вакансий, временно скрытых вместе с черновиком. Архив при публикации не меняется.
Миграция vacancy.0011 добавляет внутренний resume_on_publish с default=false; старые закрытые записи,
включая черновики, сохраняются в архиве, поскольку причина закрытия ранее не фиксировалась.

Не проверены deployed dev, реальная доставка email и полный frontend suite. Эти проверки не объявляются пройденными.
Полный backend suite запускает CI PR. Порядок внедрения: API + миграция → Angular → ручная dev acceptance.
