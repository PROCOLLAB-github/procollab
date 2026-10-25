<!-- @format -->

# QA01: совместимость редактора Project

25.10.2026. При проверке обычного Project3 и старой конкурсной заявки Project4/program34 обнаружена пустая вкладка «Данные для конкурсов» после перехода с команды. Выбранный additional renderer теперь загружается сразу при выборе вкладки (`@defer (on immediate)`). API, видимые поля и остальные вкладки сохранены.

Product fix: d0b7ba6ea2087f979ca51fb0f6cb03e28d3c7845. Backend runtime db7ffe4d6124b16232685fb49f77105f1436bacf, C001.16.0 без изменений. [Общая приемка и границы evidence](https://github.com/PROCOLLAB-github/api/blob/f9ca4c45c020b9316a9b48910d77e994a867a29d/docs/qa/program-solutions-legacy-acceptance-20261025/README.md), [каноническое ТЗ](https://chatgpt.com/space/page_9632e9ed74588191b6b3e4b397d55175).

Новый parent integration test проверяет появление выбранной панели без idle callback. Дочерний renderer в нем stub; настоящие case/textarea и отправка проверены браузером. Содержательный red run до fix — один assert FAIL, после4/4 PASS; ранний cancelIdleCallback setup error отделен от этого red run.

Полный frontend:2844 tests/480 files, strict C00 types, development build, scoped ESLint и locked Prettier3.8.3 по2017 исходным files PASS. Backend148 native PostgreSQL tests проверяют прежние проекты/привязки/команды/приглашения/сдачу/кейсы. Полный backend db7ffe4 CI:1717/OK на PG и1717/OK(skipped59) в General; это refs соответствующего backend source.

Реальный браузер: сохранение обоих проектов, принятие приглашения, изменение роли, отклонение и отзыв, два принятых участника без pending. Обычный Project опубликован по прежнему save; старая заявка сохраняет конкурсные поля, отменяет подтверждение без сдачи и отправляется одним POST /programs/partner-program-projects/3/submit/. Использованы11 resumed invocations: часть фаз завершена до fix, поля и submit — после. Исторические harness failures/dynamic import сохранены; единый непрерывный зеленый run не заявляется. После submit editor guard возвращает на прежний Project detail.

Все ранее существовавшие строки22 выбранных доменных моделей совпали с baseline. Намеренно созданы только2 свежих Project для проверки старого пути, новых ProgramSolution=0. Origins заменены только в generated development build copy; исходные environments не менялись. Raw: `Z:/Документы/PROCOLLAB-dev/design-artifacts/program-solutions-20261024/qa01-legacy`. Полная visual/a11y/zoom/CDN приемка не заявляется.

Пользователь согласовал административные исключения после сдачи с обязательным сохранением старых программ/проектов; они требуют отдельной реализации. QA01/REL01, manager/public UI и отдельные согласования остаются открытыми. Merge/deploy/автоматического переноса данных не было.
