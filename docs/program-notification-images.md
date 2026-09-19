<!-- @format -->

# Изображение программных уведомлений

Backend возвращает `image_url: string | null` отдельно от настоящего пользователя
`actor`. Общий CamelcaseInterceptor преобразует его в `imageUrl`; DTO и domain
сохраняют nullable-контракт. Repository нормализует отсутствие поля в старом API
в `null`, не извлекая программу из actionUrl и не выполняя Program detail GET.

| Тип                          | Изображение                 | Иконка при отсутствии или ошибке |
| ---------------------------- | --------------------------- | -------------------------------- |
| `program_news_published`     | Только `imageUrl` программы | `feed`                           |
| `program_material_published` | Только `imageUrl` программы | `file`                           |
| `course_access_opened`       | Только `imageUrl` программы | `academic-hat`                   |
| Остальные типы               | Прежний `actor.avatar`      | Прежняя иконка типа              |

Для программных событий actor avatar не используется даже при `imageUrl=null`.
Изображение остаётся поверх существующей иконки; при `error` img скрывается
прежним обработчиком. Размер 42 × 42 px, CSS, unread dot, время, стрелка,
pagination, polling, loading/error и mark read/all read не меняются.

Заголовок и сообщение выводятся непосредственно из API:

- NEWS: «Новая публикация» / «В программе «…» появилась новость.»
- MATERIAL: «Новый материал» / «В программе «…» добавлен материал «…».»
- COURSE: «Открыт доступ к курсу» / «В программе «…» открыт доступ к курсу «…».»

Для будущего выпуска нужен backend-контракт и schema migration
`notifications.0003_notification_image_url`. Исторические строки не переписываются:
они сохраняют старый текст и `image_url=null`, поэтому показывают иконку типа.
Новых зависимостей, workflow-изменений и ручного snake/camel mapping нет.
React и DEV этим PROD-изменением не затронуты.
