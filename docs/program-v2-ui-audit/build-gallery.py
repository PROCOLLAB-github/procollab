#!/usr/bin/env python3
"""Собрать автономную галерею из настоящих снимков Angular, без внешних ресурсов."""
import json
from pathlib import Path
import sys

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent
LABELS = {
    "participants": "Участники", "projects": "Заявки и решения", "experts": "Эксперты",
    "distribution": "Распределение экспертов", "results": "Результаты", "analytics": "Аналитика",
    "settings-basic": "Настройки — Основное", "settings-dates": "Настройки — Сроки",
    "settings-materials": "Настройки — Материалы", "settings-project-form": "Настройки — Форма решения",
    "settings-criteria": "Настройки — Оценивание", "settings-organizers": "Настройки — Организаторы",
    "settings-registration": "Настройки — Регистрация", "certificates": "Сертификаты",
}
FIGMA = {
    "participants": "822-3220", "projects": "179-3341", "experts": "452-3220",
    "distribution": "452-3221", "results": "526-3628", "analytics": "753-3219",
    "settings-basic": "179-3343", "settings-dates": "179-3497", "settings-materials": "179-3626",
    "settings-project-form": "227-3220", "settings-criteria": "267-3220",
    "settings-organizers": "582-9039", "settings-registration": "652-3220", "certificates": "904-3220",
}
items = []
for screen, label in LABELS.items():
    for width in (320, 390, 768, 1440, 1920):
        before = f"screenshots/before/v2-{screen}-{width}.png"
        after = f"screenshots/after/v2-{screen}-{width}.png"
        reference = f"screenshots/before/v1-{screen}-{width}.png"
        if all((ROOT / file).exists() for file in (before, after)):
            items.append({"screen": screen, "label": label, "width": width, "before": before,
                          "after": after, "reference": reference if (ROOT / reference).exists() else None,
                          "figma": FIGMA[screen]})

for file in sorted((ROOT / "screenshots/before/details").glob("v2-*.png")):
    scenario, width = file.stem[3:].rsplit("-", 1)
    after = ROOT / "screenshots/after/details" / file.name
    reference = file.with_name("v1-" + file.name[3:])
    if after.exists():
        items.append({"screen": "detail-" + scenario, "label": "Диалог / состояние — " + scenario,
                      "width": int(width), "before": str(file.relative_to(ROOT)),
                      "after": str(after.relative_to(ROOT)),
                      "reference": str(reference.relative_to(ROOT)) if reference.exists() else None})

assert items, "Нет пар снимков до/после"
template = r'''<!doctype html>
<html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PROCOLLAB — аудит программ V1/V2</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:24px;font:14px/1.5 Arial,sans-serif;color:#202124;background:#f6f7f9}
h1{font-size:22px;margin:0 0 8px}h2{font-size:16px;margin:0}p{margin:8px 0}a{color:#1762a4}
header,.controls,.note{max-width:1280px;margin:0 auto 20px}.controls{display:flex;gap:16px;flex-wrap:wrap;align-items:end}
label{display:flex;flex-direction:column;gap:5px}select{font:inherit;padding:8px;max-width:100%;border:1px solid #b7bdc7;border-radius:4px}
button{font:inherit;padding:8px;cursor:pointer}a:focus-visible,button:focus-visible,select:focus-visible{outline:3px solid #1762a4;outline-offset:3px}
.panels{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.panel{min-width:0;background:white;border:1px solid #cbd0d8;border-radius:6px;overflow:hidden}
.panel-title{padding:12px;display:flex;gap:16px;align-items:center;justify-content:space-between;border-bottom:1px solid #cbd0d8}
.viewport{overflow:auto;max-height:76vh;min-height:200px}.viewport img{display:block;width:100%;height:auto;max-width:none}
.reference{margin-top:24px;max-width:1100px}.reference .viewport{max-height:60vh}
.note{margin-top:24px;font-size:13px;color:#4b5563}details summary{cursor:pointer;padding:8px 0}code{font-size:12px}
table{border-collapse:collapse;font:10pt/1.5 Arial,sans-serif}th,td{padding:6px 12px;border:1px solid #cbd0d8;text-align:left}th{background:#edf0f4}
@media(max-width:760px){body{padding:12px}.panels{grid-template-columns:1fr}.controls{gap:10px}.viewport{max-height:65vh}h1{font-size:19px}}
</style>
<header><h1>Управление программами PROCOLLAB: до / после</h1>
<p>Настоящие снимки Angular с одинаковыми изолированными данными. «До» — исходный код <code>9ef90b58</code>. Эталон V1 доступен ниже каждой пары.</p>
<p><a href="README.md">Матрица, изменения и ограничения</a> · <a href="REVIEW.md">Проверка требований</a> · <a href="verification-summary.json">Результаты проверок</a></p></header>
<div class="controls"><label>Экран<select id="screen"></select></label><label>Ширина окна<select id="width"></select></label>
<label>Масштаб снимка<select id="scale"><option value="fit">По ширине панели</option><option value="1">100%</option><option value="0.5">50%</option></select></label>
<button id="reset" type="button">В начало снимков</button><a id="figma" target="_blank" rel="noreferrer">Соответствующий фрейм Figma</a></div>
<main><div class="panels"><section class="panel"><div class="panel-title"><h2>V2 — до</h2><a id="before-link" target="_blank">Оригинал PNG</a></div><div class="viewport" id="before-viewport"><img id="before" alt="Интерфейс программы V2 до исправления"></div></section>
<section class="panel"><div class="panel-title"><h2>V2 — после</h2><a id="after-link" target="_blank">Оригинал PNG</a></div><div class="viewport" id="after-viewport"><img id="after" alt="Интерфейс программы V2 после исправления"></div></section></div>
<details class="reference"><summary>Показать исходную реализацию V1 для сравнения</summary><div class="panel"><div class="panel-title"><h2>V1 — исходный эталон реализации</h2><a id="reference-link" target="_blank">Оригинал PNG</a></div><div class="viewport"><img id="reference" alt="Исходный интерфейс программы V1"></div></div></details></main>
<div class="note"><p>Для длинных страниц прокручивайте каждый снимок. Масштаб 100% сохраняет размер пикселей. Названия сущностей и дополнительные действия V2 сохранены по контракту Solution.</p>
<table><thead><tr><th>Проверка</th><th>Результат</th></tr></thead><tbody><tr><td>Настроенный Vitest-набор</td><td>3089 тестов, 498 файлов — успешно</td></tr><tr><td>Основные экраны</td><td>14 экранов × 2 версии × 5 ширин — 140 снимков после</td></tr><tr><td>Взаимодействия, состояния, визуальные контракты</td><td>395 + 40 + 5 — успешно</td></tr><tr><td>Оптимизированный артефакт</td><td>16 браузерных проверок — успешно</td></tr></tbody></table>
<p>Стандартная production-сборка не проходит: сетевой запрет Google Fonts и пять существовавших CSS-budget превышений. Оптимизированный диагностический артефакт собран с отключением только скачивания шрифта и контроля budgets. Реальные программы и API не проверены: доступ организатора не настроен.</p></div>
<script>
const items = __ITEMS__;
const screen=document.querySelector('#screen'),width=document.querySelector('#width'),scale=document.querySelector('#scale');
const screens=[...new Map(items.map(i=>[i.screen,i.label]))];
for(const [value,label] of screens){const option=new Option(label,value);screen.add(option)}
screen.value=screens.some(([s])=>s==='experts')?'experts':screens[0][0];
function widths(){const selected=width.value||'1440';width.replaceChildren();for(const w of [...new Set(items.filter(i=>i.screen===screen.value).map(i=>i.width))])width.add(new Option(w+' px',w));width.value=[...width.options].some(o=>o.value===selected)?selected:width.options[0].value;render()}
function render(){const item=items.find(i=>i.screen===screen.value&&i.width===Number(width.value));for(const name of ['before','after','reference']){const img=document.querySelector('#'+name),link=document.querySelector('#'+name+'-link');if(item[name]){img.src=item[name];link.href=item[name]}img.style.width=scale.value==='fit'?'100%':Number(scale.value)*item.width+'px'}document.querySelector('.reference').hidden=!item.reference;const link=document.querySelector('#figma');link.hidden=!item.figma;if(item.figma)link.href='https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id='+item.figma;reset()}
function reset(){document.querySelectorAll('.viewport').forEach(p=>p.scrollTo(0,0))}
screen.onchange=widths;width.onchange=render;scale.onchange=render;document.querySelector('#reset').onclick=reset;widths();
</script></html>'''
(ROOT / "gallery.html").write_text(template.replace("__ITEMS__", json.dumps(items, ensure_ascii=False).replace("</", "<\\/")))
print(json.dumps({"pairs": len(items), "screens": len(set(i["screen"] for i in items))}))
