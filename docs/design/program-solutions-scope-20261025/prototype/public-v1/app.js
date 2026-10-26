/* Только синтетические данные. Сеть и реальные API не используются. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formats = {
    noncompetitive: {name:'Практикум командных решений',label:'Неконкурсная программа',names:['Сервис поддержки студентов','Карта городских инициатив','Помощник волонтерских команд','Мастерская цифровых навыков']},
    kch: {name:'Кейс-чемпионат PROCOLLAB',label:'Кейс-чемпионат',names:['Сервис поддержки студентов','Доступный городской транспорт','Платформа развития команд','Новая модель стажировок']},
    hack: {name:'Хакатон PROCOLLAB',label:'Хакатон',names:['Помощник волонтерских команд','Городские данные: открытый API','Сервис распределения задач','Платформа цифровых навыков']}
  };
  const people = [
    {user:{id:101,first_name:'Иван',last_name:'Токарев',avatar_url:null},role:'captain',specialization:'Product Manager',is_captain:true},
    {user:{id:102,first_name:'Анна',last_name:'Смирнова',avatar_url:null},role:'member',specialization:'Дизайнер',is_captain:false},
    {user:{id:103,first_name:'Дмитрий',last_name:'Иванов',avatar_url:null},role:'member',specialization:'Backend-разработчик',is_captain:false}
  ];
  let format = 'noncompetitive', scenario = 'ready';
  const limit = 20;
  function current() {
    const q = new URLSearchParams(location.search);
    return {search:q.get('search') || '',offset:Math.max(0,Number(q.get('offset'))||0),solution:q.get('solution'),tab:q.get('tab')==='team'?'team':'materials'};
  }
  function url(changes) {
    const q = new URLSearchParams(location.search);
    for(const [key,value] of Object.entries(changes)) value===null||value==='' ? q.delete(key) : q.set(key,String(value));
    return location.pathname+(q.size?'?'+q:'');
  }
  function navigate(changes, focus = true) {history.pushState({},'',url(changes));render();if(focus)$('#content').focus();}
  const fullName = person => [person.first_name,person.last_name].filter(Boolean).join(' ') || 'Участник';
  function cards() {
    return Array.from({length:23},(_,i)=>({application:{kind:'solution',program_id:6,solution_id:501+i,name:i<4?formats[format].names[i]:`Командное решение ${i+1}`},published_at:'2026-10-25T06:00:00+03:00',captain:people[i%3].user,accepted_count:i%3+1}));
  }
  function title(card) {return scenario==='long' ? 'Разработка комплексного решения для поддержки студенческих команд и взаимодействия с партнерами программы в регионах России' : card.application.name;}
  function searchForm(search) {return `<form class="search" id="search-form" role="search"><label class="search-field"><img src="../assets/search.svg" alt=""><span class="visually-hidden">Поиск по названию решения</span><input name="search" type="search" maxlength="200" placeholder="Поиск по названию решения" value="${esc(search)}"></label><button class="ui-button" type="submit">Найти</button></form>`;}
  function state(title,copy,action='') {return `<section class="state" role="status"><h2>${title}</h2><p>${copy}</p>${action}</section>`;}
  function retry(detail=false) {return `<button class="ui-button" type="button" data-retry="${detail?'detail':'list'}">Повторить</button>`;}
  function list() {
    const q=current(), all=cards(), found=all.filter(card=>card.application.name.toLocaleLowerCase('ru').includes(q.search.toLocaleLowerCase('ru')));
    const rows=found.slice(q.offset,q.offset+limit);
    let body='';
    if(scenario==='loading')body=`<p class="visually-hidden" role="status">Загружаем решения…</p><div class="cards" aria-hidden="true">${Array.from({length:5},()=>'<div class="skeleton-card"></div>').join('')}</div>`;
    else if(scenario==='error')body=state('Не удалось загрузить решения','Попробуйте еще раз. Поиск сохранен.',retry());
    else if(scenario==='empty')body=state('Опубликованных решений пока нет','Когда работы программы будут опубликованы, они появятся здесь.');
    else if(scenario==='no-results'||!found.length)body=state('Решения не найдены','Попробуйте другое название или сбросьте поиск.','<button class="ui-button" type="button" data-reset>Сбросить поиск</button>');
    else body=`<div class="result-summary" role="status"><span>Найдено решений · ${found.length}</span>${q.search?'<button type="button" class="text-button" data-reset>Сбросить поиск</button>':''}</div><ul class="cards">${rows.map(card=>`<li><a class="card__body published-card" data-open="${card.application.solution_id}" href="${url({solution:card.application.solution_id,tab:null})}" aria-label="Открыть решение «${esc(title(card))}»"><h3>${esc(title(card))}</h3><p class="card-captain">Капитан<br>${esc(fullName(card.captain))}</p><p class="card-count">Участников · ${card.accepted_count}</p><span class="card-open">Открыть решение →</span></a></li>`).join('')}</ul><nav class="pagination" aria-label="Страницы решений"><span>${q.offset+1}–${q.offset+rows.length} из ${found.length}</span><div class="pagination-actions"><button class="ui-button" type="button" data-page="${Math.max(0,q.offset-limit)}" ${q.offset===0?'disabled':''}>Назад</button><button class="ui-button" type="button" data-page="${q.offset+limit}" ${q.offset+limit>=found.length?'disabled':''}>Далее</button></div></nav>`;
    return `<section class="prototype-cards" aria-labelledby="solutions-title" ${scenario==='loading'?'aria-busy="true"':''}><div class="section-heading"><h2 id="solutions-title">Решения</h2></div><p class="section-note">Опубликованные работы участников программы</p>${searchForm(q.search)}${body}</section>`;
  }
  function fields() {
    const shared=[{id:1,name:'О решении',type:'textarea',value:'Сервис помогает студенческим командам находить поддержку, обмениваться опытом и организовывать совместную работу.\n\nВ материалах описаны сценарий использования, подход к реализации и результаты пилота.'},{id:2,name:'Размер пилота',type:'number',value:0},{id:3,name:'Пилот завершен',type:'checkbox',value:false}];
    if(format==='hack')shared.push({id:4,name:'Репозиторий',type:'url',value:'https://example.com/team/repository'},{id:5,name:'Демонстрация',type:'url',value:'https://example.com/demo'});
    else shared.push({id:4,name:'Презентация',type:'file',value:{url:'https://example.com/materials/solution.pdf'}},{id:5,name:'Направление',type:'select',value:'Образование'});
    if(scenario==='partial')for(const field of shared)if([1,4].includes(field.id))field.value=null;
    if(scenario==='long'){shared[0].name='Подробное описание предлагаемого решения и результатов проверки основных гипотез';shared[0].value+='\n\n'+('Развитие продукта, работа команды и обратная связь участников. '.repeat(35));shared[4].value=format==='hack'?'https://example.com/demo/'+('long-path-'.repeat(20)):'Образование и развитие студенческих инициатив';}
    return shared;
  }
  function materials() {
    return `<div class="answer-list">${fields().map(field=>{
      let answer;
      if(field.value===null||field.value==='')answer='<p class="muted">Не добавлено</p>';
      else if(field.type==='checkbox')answer=`<p>${field.value?'Да':'Нет'}</p>`;
      else if(field.type==='file')answer=`<a class="file-link" data-demo-link href="${esc(field.value.url)}" target="_blank" rel="noopener noreferrer"><img src="../assets/file.svg" alt="">Открыть материал <span aria-hidden="true">↗</span><span class="visually-hidden">, новая вкладка</span></a>`;
      else if(field.type==='url')answer=`<a data-demo-link href="${esc(field.value)}" target="_blank" rel="noopener noreferrer">${esc(field.value)} <span aria-hidden="true">↗</span><span class="visually-hidden">, новая вкладка</span></a>`;
      else answer=`<p>${esc(field.value)}</p>`;
      return `<section class="answer"><h3>${esc(field.name)}</h3>${answer}</section>`;
    }).join('')}</div>`;
  }
  function team(card) {
    const members=[{user:card.captain,specialization:people.find(p=>p.user.id===card.captain.id).specialization},...people.filter(p=>p.user.id!==card.captain.id)].slice(0,card.accepted_count);
    return `<p class="team-intro">Участников · ${members.length}</p><ul>${members.map((member,i)=>`<li class="team-row"><span class="avatar" aria-hidden="true">${esc(member.user.first_name[0]+member.user.last_name[0])}</span><div><p class="member-name">${esc(scenario==='long'?'Александра Константинопольская-Рождественская':fullName(member.user))}</p><p class="member-role">${i===0?'Капитан':'Участник'}</p></div><span class="specialization">${esc(member.specialization||'')}</span></li>`).join('')}</ul>`;
  }
  function detail() {
    const q=current(), card=cards().find(item=>String(item.application.solution_id)===q.solution), back=`<a class="back-link" data-back href="${url({solution:null,tab:null})}">← Все решения программы</a>`;
    if(scenario==='not-found'||!card)return `<div class="prototype-solution">${back}${state('Решение недоступно','Возможно, ссылка изменилась или материалы не опубликованы. Посмотрите другие решения программы.')}</div>`;
    const nav=`<nav aria-label="Разделы решения"><a data-tab="materials" href="${url({tab:null})}" ${q.tab==='materials'?'aria-current="page"':''}>Решение</a><a data-tab="team" href="${url({tab:'team'})}" ${q.tab==='team'?'aria-current="page"':''}>Команда</a></nav>`;
    let content=q.tab==='team'?team(card):materials();
    if(scenario==='detail-error')content=state('Не удалось открыть материалы','Попробуйте еще раз. Решение и выбранная вкладка сохранены.',retry(true));
    if(scenario==='loading')content='<p role="status">Загружаем материалы…</p><div class="skeleton" aria-hidden="true"></div>';
    return `<div class="prototype-solution"><article class="solution">${back}<header><h2>${esc(title(card))}</h2><p class="muted">Опубликовано 25 октября 2026</p></header>${nav}<section aria-label="${q.tab==='team'?'Команда решения':'Материалы решения'}">${content}</section></article></div>`;
  }
  function render() {
    $('#demo-notice').hidden=true;
    $('#program-name').textContent=formats[format].name;
    $('#program-format').textContent=formats[format].label;
    $('#scope-note').textContent=format==='noncompetitive'?'Публичный API сохраненных неконкурсных решений готов. Подключение этого экрана ожидает согласования дизайна.':'Публичный API сданных конкурсных решений готов. Публикация несданных черновиков остается открытым вопросом; дизайн ожидает согласования.';
    $('#content').innerHTML=current().solution?detail():list();
    const form=$('#search-form');if(form)form.addEventListener('submit',event=>{event.preventDefault();navigate({search:new FormData(form).get('search').trim(),offset:null});});
    document.title=(current().solution?'Решение':'Решения')+' — '+formats[format].name+' — PROCOLLAB';
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('a,button');if(!target)return;
    if(target.matches('[data-demo-link]')){event.preventDefault();$('#demo-notice').hidden=false;return;}
    if(target.matches('[data-reset]')){scenario='ready';$('#scenario').value='ready';navigate({search:null,offset:null});}
    if(target.matches('[data-page]'))navigate({offset:Number(target.dataset.page)||null});
    if(target.matches('[data-retry]')){scenario='ready';$('#scenario').value='ready';render();$('#content').focus();}
    if((event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)||event.button!==0)return;
    if(target.matches('[data-open]')){event.preventDefault();navigate({solution:target.dataset.open,tab:null});window.scrollTo(0,0);}
    if(target.matches('[data-back]')){event.preventDefault();const id=current().solution;navigate({solution:null,tab:null},false);const card=$(`[data-open="${id}"]`);if(card)card.focus();else $('#content').focus();}
    if(target.matches('[data-tab]')){event.preventDefault();const tab=target.dataset.tab;navigate({tab:tab==='team'?'team':null},false);$(`[data-tab="${tab}"]`).focus();}
  });
  $('#format').addEventListener('change',event=>{format=event.target.value;history.replaceState({},'',location.pathname);render();});
  $('#scenario').addEventListener('change',event=>{scenario=event.target.value;if(['not-found','detail-error','partial'].includes(scenario)&&!current().solution)history.pushState({},'',url({solution:503,tab:null}));render();});
  window.addEventListener('popstate',()=>{render();$('#content').focus();});
  render();
})();
