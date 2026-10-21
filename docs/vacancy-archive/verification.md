<!-- @format -->

# Проверка архива вакансий — 21.10.2026

Дизайн: [согласованный макет](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE/PROCOLLAB-Design-System-v1?node-id=776-5414).
Вкладки в Figma и Angular имеют высоту 27 px, без общей серой подложки.
Использованы существующие Card, Button, Modal, State, VacancySkills и VacancyStatus; Mont загружен в браузере.

## Выполненные проверки

| Уровень       | Evidence                                                                                                                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source        | UpdateVacancyUseCase → PATCH /vacancies/{id}/, DeleteVacancyUseCase → DELETE. Состояние списка меняется после успешного ответа; форма не сбрасывается при изменении соседней карточки.                                                                                                                                              |
| Angular tests | `npm run test:ci -- projects/social_platform/src/app/api/project/facades/edit/project-vacancy.service.spec.ts projects/social_platform/src/app/api/project/facades/edit/ui/project-vacancy-ui.service.spec.ts projects/social_platform/src/app/ui/widgets/vacancy-card/vacancy-card.component.spec.ts` — 3 файла, 45 тестов passed. |
| Build         | `npm run build:pr` — exit 0. Preview build с существующим entry point `docs/vacancy-redesign/preview/main.ts` — exit 0. Sass deprecation warnings относятся к существующим стилям.                                                                                                                                                  |
| Browser       | `node docs/vacancy-archive/browser-acceptance.cjs` с локальным preview на 4371 — 58 проверок, JS errors []. Ширины 1440/768/390/320; Mont; touch; tabs keyboard; модалки; счетчики; отмена; busy; повтор после ошибки; появление отклика перед удалением; пустые списки.                                                            |
| Static        | ESLint измененных TS и Stylelint двух измененных SCSS — exit 0.                                                                                                                                                                                                                                                                     |
| API           | Связанная API-ветка от dev 1c424ff: `manage.py test vacancy.tests projects.tests.test_program_project_detail_access --noinput --keepdb` — 106 tests passed на PostgreSQL 18.1, Python 3.11.15 / Django 4.2.11. Models check и makemigrations --check --dry-run — exit 0, миграций нет.                                              |

[Результаты браузера](browser-results.json), [desktop](archive-modal-1440.png), [mobile](archive-modal-390.png).
Browser использует fixtures и не выполняет мутации live API или отправку писем.

## Requirement audit

| AC  | Verdict                    | Evidence                                                                                                                                           |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | PASS                       | height=27, счетчики и фильтрация проверены в браузере на четырех ширинах; геометрия карточек на desktop — две колонки по 554 px в preview.         |
| AC2 | PASS                       | API-тест атомарного закрытия и уведомления ожидающих; browser проверяет ожидание ответа и успешный перенос.                                        |
| AC3 | PASS для ручного возврата  | Сервер отклоняет возобновление в draft/private проекте; история решений сохраняется. Повторная публикация — отдельный открытый вопрос ниже.        |
| AC4 | PASS                       | Подтверждение и успешное удаление проверены API, unit и browser.                                                                                   |
| AC5 | PASS                       | API запрещает удаление во всех состояниях откликов и обеих вкладках; UI предлагает архив.                                                          |
| AC6 | PASS                       | Ошибка и повтор, защита двойного запроса, появление отклика после открытия модалки; invalid skills не закрывают вакансию и не удаляют навыки.      |
| AC7 | PASS в проверенном контуре | Empty, unknown count, 320/390, keyboard tabs, Escape и focus после переноса, сохранение формы проверены. Полный accessibility audit не выполнялся. |

## Review и открытый вопрос

По итоговому diff проверены permissions, порядок блокировок Project → Vacancy → VacancyResponse,
сохранение response_count как числа ожидающих, отсутствие N+1 в каталоге, readonly total_response_count,
контекст проекта, server errors, Mont, фокус и отсутствие переполнения.
Кодовые замечания в проверенном контуре исправлены; связанный frontend/API diff требует совместного внедрения.

**HOLD перед интеграцией:** существующий `projects/signals.py:update_vacancy` активирует все закрытые вакансии
при переходе проекта draft → published. Пока это правило сохранено. Пользователю задан вопрос:
оставлять архивные до ручного возврата или сохранить автопубликацию. Новая семантика и миграция без ответа не вводились.

Не проверены deployed dev, реальная доставка email и полный backend/frontend suite. Эти проверки не объявляются пройденными.
После решения вопроса и закрытия связанности PR порядок внедрения: API → Angular → ручная dev acceptance.
