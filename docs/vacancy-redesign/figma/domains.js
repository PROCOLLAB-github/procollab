
const area=await figma.getNodeByIdAsync("51:1752");const comps={};const order=[];
function domain(name,width=480){const n=mark(figma.createComponent());area.appendChild(n);n.name="Proposed / Vacancy pattern / "+name;n.layoutMode="VERTICAL";n.resize(width,1);n.layoutSizingVertical="HUG";n.fills=[];n.itemSpacing=0;n.description="PROPOSED feature composition — current Angular candidate. Nested Card, Badge, Status, Button instances. No global master or token mutation. Canonical Mont; Inter preview. Design approval required.";order.push(n);comps[name]=n.id;return n;}
function actions(parent,w,left,right,rightKind="primary"){const a=fill(frame(parent,"Actions",w,"HORIZONTAL",8));fill(button(a,left,"outline",(w-8)/2));fill(button(a,right,rightKind,(w-8)/2));return a;}
for(const [name,role,kind,empty] of [["Project · active",longTitle,"active",false],["Project · empty skills","QA","active",true],["Project · closed","Дизайнер","closed",false],["Project · one skill","Аналитик","closed",false]]){
 const root=domain(name);root.description+=" Angular VacancyCardComponent + VacancySkillsComponent.";
 const {content:c,width:w}=cardBody(root,480);const top=fill(frame(c,"Role + status",w,"HORIZONTAL",12));top.counterAxisAlignItems="MIN";
 fill(text(top,"Vacancy.role",role,"Heading / Small",w-100));status(top,kind);
 if(!empty)fill(text(c,"Specialization","Ищем: Разработчик","Caption",w,"color/text/secondary"));
 if(name.includes("one skill")){const r=fill(frame(c,"One skill",w,"HORIZONTAL",8));const b=inst(r,"53:1778","TypeScript",100);prop(b,"Label","TypeScript");}
 else skills(c,w,3,empty);
 actions(c,w,"Редактировать","Удалить","danger");
}
for(const [name,role,kind,empty,manage] of [["Catalog · active",longTitle,"active",false,true],["Catalog · empty","QA","active",true,false],["Catalog · closed","Дизайнер","closed",false,false],["Catalog · one skill","Аналитик","closed",false,false]]){
 const root=domain(name);root.description+=" Angular ProjectVacancyCardComponent. Fixed title/preview capacity can align desktop actions; mobile grows.";
 const {content:c,width:w}=cardBody(root,480);const top=fill(frame(c,"State + date",w,"HORIZONTAL",12));status(top,kind);const date=fill(text(top,"Created at","29.09.2026","Caption",w-110,"color/text/secondary"));date.textAlignHorizontal="RIGHT";
 fill(text(c,"Vacancy.role",role,"Heading / Small",w));identity(c,w);
 if(!empty)fill(text(c,"Specialization","Ищем: Разработчик","Caption",w,"color/text/secondary"));
 fill(text(c,"Salary",empty?"По договорённости":"120 000 ₽","Body / Small",w));
 skills(c,w,3,empty);
 fill(text(c,"Description preview",empty?"Описание пока не добавлено":description.slice(0,151)+"…","Body / Small",w,empty?"color/text/secondary":"color/text/primary"));
 if(kind==="closed"){button(c,"Подробнее","outline",w).layoutSizingHorizontal="FILL";}
 else actions(c,w,"Подробнее",manage?"Посмотреть отклики":"Откликнуться");
}
for(const kind of ["pending","accepted","rejected"]){
 const root=domain("Response · "+kind,720);root.description+=" Angular VacancyResponsesComponent + VacancyLetterComponent. Decisions only while pending; server-confirmed transition.";
 const {content:c,width:w}=cardBody(root,720);
 const head=fill(frame(c,"Candidate + response state",w,"HORIZONTAL",12));fill(identity(head,w-180,true));const meta=frame(head,"Response status + date",150,"VERTICAL",6);status(meta,kind);fill(text(meta,"Response date","Отклик от 29.09.2026","Caption",150,"color/text/secondary"));
 skills(c,w,6);
 rule(c,w);fill(text(c,"Letter heading","Сопроводительное письмо","Caption",w,"color/action/link"));
 fill(text(c,"Cover letter",kind==="accepted"?"Сопроводительное письмо не добавлено":letter,"Body / Small",w));
 if(kind!=="accepted")fill(text(c,"Attachment","Прикреплённый файл:  Резюме.pdf","Caption",w,"color/action/link"));
 if(kind==="pending")actions(c,w,"Отклонить","Принять");
}
for(const kind of ["pending","accepted","rejected"]){
 const root=domain("My response · "+kind,960);root.description+=" Angular ResponseCardComponent + VacancyLetterComponent.";
 const {content:c,width:w}=cardBody(root,960);const head=fill(frame(c,"Vacancy + response state",w,"HORIZONTAL",12));fill(text(head,"Vacancy.role",longTitle,"Heading / Small",w-175));status(head,kind,kind==="pending"?"На рассмотрении":undefined);
 fill(text(c,"Project link","Проект: PROCOLLAB — платформа для совместных проектов","Caption",w,"color/action/link"));
 fill(text(c,"Response date","Отклик от 29.09.2026","Caption",w,"color/text/secondary"));rule(c,w);fill(text(c,"Letter heading","Сопроводительное письмо","Caption",w,"color/action/link"));
 fill(text(c,"Cover letter",kind==="accepted"?"Сопроводительное письмо не добавлено":letter+(kind==="rejected"?"\nРаботал над сложными формами, адаптивными страницами и командными инструментами. …":""),"Body / Small",w));
 if(kind==="rejected")button(c,"Показать полностью","outline",180);
 if(kind!=="accepted")fill(text(c,"Attachment","Прикреплённый файл:  Резюме.pdf","Caption",w,"color/action/link"));
}
{
 const root=domain("Detail · header",1000);const {content:c,width:w}=cardBody(root,1000);const head=fill(frame(c,"Full role + state",w,"HORIZONTAL",12));fill(text(head,"Full vacancy title",longTitle,"Heading / Medium",w-100));status(head,"active");identity(c,w);fill(text(c,"Specialization","Ищем: Разработчик","Caption",w,"color/text/secondary"));rule(c,w);fill(text(c,"Key conditions","120 000 ₽   ·   Удалённая работа   ·   Москва","Body / Small",w));
}
{
 const root=domain("Detail · description and skills",680);const {content:c,width:w}=cardBody(root,680);fill(text(c,"Heading","Описание вакансии","Caption",w,"color/action/link"));fill(text(c,"Full description",description+"\n\nВы будете создавать новые интерфейсы, работать с дизайн-системой и улучшать доступность приложения. Вместе обсудим задачи и выберем удобный ритм работы.","Body / Small",w));rule(c,w);fill(text(c,"Skills heading","Навыки","Caption",w,"color/action/link"));skills(c,w,8);
}
{
 const root=domain("Detail · conditions",320);const {content:c,width:w}=cardBody(root,320);fill(text(c,"Heading","Условия и отклики","Caption",w,"color/action/link"));
 for(const [label,value] of [["Город","Москва"],["Формат работы","Удалённая работа"],["Опыт","От 1 года до 3 лет"],["График","Гибкий график"],["Зарплата","120 000 рублей"]]){const r=fill(frame(c,label,w,"VERTICAL",4));fill(text(r,"Label",label,"Caption",w,"color/text/secondary"));fill(text(r,"Value",value,"Body / Small",w));}
 fill(button(c,"Посмотреть отклики","primary",w));rule(c,w);fill(text(c,"Contact heading","Контакты проекта","Caption",w,"color/action/link"));fill(text(c,"Project contact","https://procollab.ru","Body / Small",w,"color/action/link"));
}
let yy=1460;for(let i=0;i<order.length;i+=3){const row=order.slice(i,i+3);let xx=40;let mh=0;for(const n of row){n.x=xx;n.y=yy;xx+=n.width+40;mh=Math.max(mh,n.height);}yy+=mh+80;}
area.resizeWithoutConstraints(3300,yy+60);
return {createdNodeIds:order.flatMap(allIds),components:comps,proposalBounds:{width:area.width,height:area.height},featureComponentCount:order.length};
