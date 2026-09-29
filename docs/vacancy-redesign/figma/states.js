
const wrapper=await figma.getNodeByIdAsync("51:1753"),section=await figma.getNodeByIdAsync("51:1751");
const board=fill(frame(wrapper,"07-states / Empty + skills states",2010,"VERTICAL",24));
fill(text(board,"Title","07 · Состояния и выбор навыков","Heading / Large",2010));
fill(text(board,"Note","Дизайн поведения: обычное/пустое/загрузка/нет результатов/выбранные навыки. Гонки сетевого поиска и общий inlineSkills ещё не воспроизводились с DEV API. Сохранение и повторное открытие проверяются после approval.","Body / Small",2010));
const row1=fill(frame(board,"Empty states / Desktop fragments + mobile",2010,"HORIZONTAL",24));
function stateTile(parent,title,width=620){const tile=frame(parent,title,width,"VERTICAL",16);bind(tile,{paddingLeft:"space/20",paddingRight:"space/20",paddingTop:"space/20",paddingBottom:"space/20",cornerRadius:"radius/medium"});tile.fills=[paint("color/background/subtle")];text(tile,"State label",title,"Heading / Small",width-40);return {tile,w:width-40};}
for(const [title,heading,detail,width] of [["Мои отклики · пусто","Вы ещё не откликались","Выберите подходящую вакансию и расскажите о себе.",660],["Каталог · нет результатов","Вакансии не найдены","Попробуйте другой запрос или измените фильтры.",660],["Mobile · пустые отклики","Вы ещё не откликались","Здесь появятся ваши отклики.",390]]){
 const t=stateTile(row1,title,width);const e=inst(t.tile,title.includes("Каталог")?"9:375":"9:365","EmptyState / "+title,t.w);fill(e);prop(e,"Title",heading);prop(e,"Detail",detail);prop(e,"Show action",false);for(const ch of e.children){if(ch.type==="TEXT")ch.layoutSizingHorizontal="FILL";}
 if(title.includes("Каталог"))button(t.tile,"Сбросить фильтры","outline",t.w);else button(t.tile,"Найти вакансию","primary",t.w);
}
const row2=fill(frame(board,"Data boundary states",2010,"HORIZONTAL",24));
{
 const t=stateTile(row2,"Detail · данные отсутствуют",660);const {content:c,width:w}=cardBody(t.tile,t.w);fill(text(c,"Role","QA","Heading / Medium",w));status(c,"active");rule(c,w);fill(text(c,"Description","Описание пока не добавлено","Body / Small",w));skills(c,w,0,true);
 for(const value of ["Город не указан","Формат работы не указан","Опыт не указан","График не указан","Зарплата: по договорённости"])fill(text(c,"Missing value",value,"Caption",w,"color/text/secondary"));
 fill(button(c,"Откликнуться","primary",w));
}
{
 const t=stateTile(row2,"Навыки · все 11 раскрыты",660);const {content:c,width:w}=cardBody(t.tile,t.w);skills(c,w,11,false,true);button(c,"Свернуть","outline",160);fill(text(c,"No skills sample","0 навыков: «Навыки не указаны»","Caption",w,"color/text/secondary"));
}
{
 const t=stateTile(row2,"Mobile · длинные строки",390);const {content:c,width:w}=cardBody(t.tile,t.w);fill(text(c,"Unbroken title","ОченьДлинноеНазваниеВакансииБезПробеловОченьДлинноеНазваниеВакансииБезПробелов","Heading / Small",w));const b=inst(c,"53:1778","Badge / stress",w);prop(b,"Label","ОченьДлинныйНавыкБезПробеловОченьДлинныйНавыкБезПробелов");fill(b);b.layoutSizingVertical="HUG";fill(text(c,"Letter","Длинное письмо не расширяет карточку; полный текст раскрывается по кнопке.","Body / Small",w));button(c,"Показать полностью","outline",w);
}
const row3=fill(frame(board,"FormPage / skills state sequence",2010,"HORIZONTAL",24));
for(const [title,id,value,hint] of [["1 · Поиск навыка","6:456","Ang","Поиск относится только к текущему запросу."],["2 · Новый запрос / loading","6:507","Type","Результат старого запроса не должен заменять текущий."],["3 · Выбрано из подсказки / библиотеки","6:456","Выберите навык","Один набор выбранных id; повторный выбор не создаёт дубль."]]){
 const t=stateTile(row3,title,620);const control=inst(t.tile,id,"Select / Searchable",t.w);prop(control,"Label","Навыки");prop(control,"Value",value);prop(control,"Hint / Error",hint);prop(control,"Show hint",true);fill(control);
 if(title.startsWith("1")){button(t.tile,"Angular · выбрать","outline",t.w);button(t.tile,"Открыть библиотеку навыков","outline",t.w);}
 if(title.startsWith("2"))fill(text(t.tile,"No results alternative","Если ответ пустой: «Навыки не найдены». Можно изменить запрос или открыть библиотеку.","Body / Small",t.w));
 if(title.startsWith("3")){const chips=fill(frame(t.tile,"Selected skills",t.w,"HORIZONTAL",8));for(const label of ["Angular","TypeScript"]){const b=inst(chips,"53:1784","Selected / "+label,130);prop(b,"Label",label);}button(t.tile,"Сохранить вакансию","primary",t.w);}
}
const row4=fill(frame(board,"Library + lifecycle",2010,"HORIZONTAL",24));
{
 const t=stateTile(row4,"Библиотека · те же выбранные id",660);text(t.tile,"Heading","Hard skills","Heading / Small",t.w);
 for(const [label,selected] of [["Angular",true],["TypeScript",true],["JavaScript",false],["Figma",false]]){const c=inst(t.tile,selected?"6:589":"6:568","Checkbox / "+label,t.w);prop(c,"Label",label);fill(c);}
 button(t.tile,"Готово · выбрано 2","primary",t.w);
}
{
 const t=stateTile(row4,"Контракт сохранения и повторного открытия",660);
 for(const value of ["Удаление снимает выбор и в чипах, и в библиотеке.","Редактирование загружает сохранённые id вакансии.","Во время сохранения кнопка недоступна; второй запрос не отправляется.","После успеха и повторного открытия набор выбранных навыков совпадает.","Ошибка не теряет введённые поля и выбранные навыки."])fill(text(t.tile,"Behavior",value,"Body / Small",t.w));
}
{
 const t=stateTile(row4,"Мобильная библиотека",390);const search=inst(t.tile,"6:825","Search / skill library",t.w);prop(search,"Query","Angular");fill(search);const c=inst(t.tile,"6:589","Checkbox / Angular",t.w);prop(c,"Label","Angular");fill(c);button(t.tile,"Готово","primary",t.w);
}
const notes=fill(frame(board,"Handoff / tokens and behavior",2010,"VERTICAL",16));
fill(text(notes,"Token contract","Связи: Button → color/action/primary #8A63E6; Card → background/primary, border/default, radius/medium; Badge → successSurface / action/secondary; Status → successSurface / errorSurface / secondary; spacing 4/8/12/16/20/24. Изменения глобальных токенов: нет.","Body / Small",2010));
fill(text(notes,"Interaction contract","Клавиатура: порядок чтения совпадает с DOM; видимый focus; Tab удерживается внутри именованной модалки, Escape закрывает, фокус возвращается к триггеру. Решение по отклику меняется только после успеха API. Figma — проверка дизайна; эти действия не имитируют рабочий backend.","Body / Small",2010));
section.resizeWithoutConstraints(2130,wrapper.height+180);
return {createdNodeIds:allIds(board),stateBoardId:board.id,stateTileIds:board.children.filter(n=>n.name.includes("states")||n.name.includes("sequence")||n.name.includes("lifecycle")).map(n=>n.id),sectionBounds:{width:section.width,height:section.height}};
