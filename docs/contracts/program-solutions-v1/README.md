<!-- @format -->

# C00 1.0.0 для FE01

Неизмененные `openapi.json` и `examples.json` из пакета C00 backend. JSON на проводе в snake_case. Источник требований: https://chatgpt.com/space/page_9632e9ed74588191b6b3e4b397d55175 . Дизайн D00 v3 утвержден 24 октября 2026 года.

`python tools/generate-solution-contract.py` генерирует 47 доменных типов и 43 независимых сценария в `domain/solution/`. После генерации выполнить scoped Prettier этих двух файлов. Фикстуры используются только тестами; production mock provider не включается.

Изменение контракта требует синхронного изменения копий backend/frontend и повторной проверки wire boundary. Реализация FE01 ограничена контекстом, созданием и чтением; все сценарии C00 не означают реализацию будущих команд.
