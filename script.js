
(() => {
  'use strict';
  // ========================= HELPERS / ESTADO GLOBAL =========================
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const html = document.documentElement;
  let locale = localStorage.getItem('fabiano-locale') || 'pt';
  let theme = localStorage.getItem('fabiano-theme') || 'dark';
  let soundOn = localStorage.getItem('fabiano-sound') === '1';
  let audioCtx = null;
  let aiHistory = [];

  // ========================= CONFIGURAÇÕES EDITÁVEIS =========================
  const SITE_CONFIG = window.FABIANO_SITE || {social:{facebook:'',instagram:''},aiEndpoint:'',whatsapp:'5511972307705'};

  // ========================= I18N / TRADUÇÃO COMPLETA =========================
  const T = {
    'nav.home':['INÍCIO','HOME'], 'nav.about': ['SOBRE','ABOUT'], 'nav.journey':['JORNADA','JOURNEY'], 'nav.projects':['PROJETOS','PROJECTS'], 'nav.work':['TRABALHOS','WORK'], 'nav.stack':['STACK','STACK'], 'nav.security':['SEGURANÇA','SECURITY'], 'nav.lab':['LAB','LAB'], 'nav.contact':['CONTATO','CONTACT'],
    'hero.eyebrow':['OPEN TO WORK','OPEN TO WORK'], 'hero.kicker':['FULL STACK · AUTOMAÇÃO · DADOS · CYBER','FULL STACK · AUTOMATION · DATA · CYBER'], 'hero.t1':['DEVELOPER','DEVELOPER'], 'hero.t2':['FULL STACK','FULL STACK'], 'hero.t3':['& CYBER','& CYBER'], 'hero.lede':['Interfaces, APIs e automações construídas entre faculdade, curiosidade e problemas reais de operação.','Interfaces, APIs and automations built between university, curiosity and real operational problems.'], 'hero.projects':['VER PROJETOS →','VIEW PROJECTS →'], 'hero.contact':['>_ FALAR COMIGO','>_ TALK TO ME'], 'hero.status':['PROFILE / CURRENT BUILD','PROFILE / CURRENT BUILD'],
    'about.eyebrow':['01 / SOBRE','01 / ABOUT'], 'about.title':['Construir é melhor<br>do que apenas <em class="crash-accent">estudar.</em>','Building is better<br>than just <em class="crash-accent">studying.</em>'], 'about.p1':['Sou estudante de Ciência da Computação na UNIP, com foco em backend, automação, dados e integração de sistemas. Minha experiência em e-commerce me ensinou a olhar para software como ferramenta de operação: algo que precisa funcionar, ser compreensível e resolver um problema.','I am a Computer Science student at UNIP focused on backend, automation, data and system integration. My e-commerce background taught me to see software as an operational tool: it must work, be understandable and solve a problem.'], 'about.p2':['Hoje transformo estudo em projetos próprios: APIs, automações, aplicações Android, sistemas web, análise de dados e fundamentos de segurança. Gosto de entender o problema, criar uma solução mínima e depois melhorar.','Today I turn study into real projects: APIs, automations, Android apps, web systems, data analysis and security foundations. I like to understand the problem, build a minimum solution and then improve it.'], 'about.quote':['“Código útil é aquele que deixa o próximo passo mais simples.”','“Useful code is the code that makes the next step simpler.”'], 'about.s1':['ANOS EM OPERAÇÕES DIGITAIS','YEARS IN DIGITAL OPERATIONS'], 'about.s2':['SEMESTRE DE CIÊNCIA DA COMPUTAÇÃO','SEMESTER IN COMPUTER SCIENCE'], 'about.s3':['PROJETOS E LABORATÓRIOS','PROJECTS AND LABS'], 'about.s4':['CURIOSIDADE TÉCNICA','TECHNICAL CURIOSITY'],
    'journey.eyebrow':['02 / JORNADA','02 / JOURNEY'], 'journey.title':['Uma jornada em<br><em class="crash-accent">camadas.</em>','A journey in<br><em class="crash-accent">layers.</em>'], 'journey.subtitle':['Cada etapa adiciona uma camada diferente de repertório. Menos promessa, mais evidência.','Each stage adds a different layer of experience. Less promise, more evidence.'],
    'journey.1.title':['Operações digitais & e-commerce','Digital operations & e-commerce'], 'journey.1.text':['Gestão de marketplaces, atendimento, anúncios, logística, dados e resolução de problemas em ambientes digitais.','Marketplace management, customer service, ads, logistics, data and problem solving in digital environments.'], 'journey.1.tags':['Mercado Livre · Amazon · Shopee · Magalu · Shein','Mercado Livre · Amazon · Shopee · Magalu · Shein'], 'journey.1.detail':['Foi a fase que me ensinou que um processo só é bom quando consegue funcionar sob pressão, com clareza e continuidade.','This phase taught me that a process is only good when it works under pressure, with clarity and continuity.'],
    'journey.2.title':['Início da Ciência da Computação','Start of Computer Science'], 'journey.2.text':['Entrada no Bacharelado em Ciência da Computação na UNIP, trazendo base formal para a prática.','Started the Computer Science bachelor’s degree at UNIP, adding formal foundations to practice.'], 'journey.2.tags':['UNIP · LÓGICA · POO · ESTRUTURAS','UNIP · LOGIC · OOP · DATA STRUCTURES'], 'journey.2.detail':['A faculdade consolidou lógica de programação, orientação a objetos, estruturas de dados, banco de dados e fundamentos de engenharia de software.','University studies consolidated programming logic, object-oriented programming, data structures, databases and software engineering foundations.'],
    'journey.3.title':['Snake em Kotlin','Snake in Kotlin'], 'journey.3.text':['Primeiro jogo em Kotlin, transformando lógica e estados em uma aplicação executável.','First Kotlin game, turning logic and state into an executable application.'], 'journey.3.detail':['O projeto marcou a passagem de exercícios isolados para um software com entrada de usuário, estados, regras e comportamento contínuo.','The project marked the move from isolated exercises to software with user input, state, rules and continuous behavior.'],
    'journey.4.title':['Calculadora dos Preguiçosos','Lazy Calculator'], 'journey.4.text':['Aplicação Android para calcular NP1, AVA, PIN e Exame com regras acadêmicas.','Android application to calculate NP1, AVA, PIN and Exam with academic rules.'], 'journey.4.detail':['Projeto funcional com validação de entradas, gerenciamento de estado, componentes reutilizáveis, reprodução de áudio e geração de APK.','Functional project with input validation, state management, reusable components, audio playback and APK generation.'],
    'journey.5.title':['Automação de Relatórios','Report Automation'], 'journey.5.text':['API → processamento → relatório → entrega. A primeira automação ponta a ponta.','API → processing → report → delivery. The first end-to-end automation.'], 'journey.5.detail':['Integração com API do Banco Central, tratamento com Pandas, exportação CSV/XLSX e envio automatizado por e-mail.','Integration with the Central Bank API, Pandas processing, CSV/XLSX export and automated e-mail delivery.'],
    'journey.6.title':['Plataforma Web de Automação','Web Automation Platform'], 'journey.6.text':['Backend Flask, interface web, formulários, endpoints, downloads e serviços no mesmo produto.','Flask backend, web interface, forms, endpoints, downloads and services in one product.'], 'journey.6.detail':['O laboratório aproximou backend e interface, com serviços separados e fluxos reais de processamento.','The lab connected backend and interface through separated services and real processing flows.'],
    'journey.7.title':['Java REST & POO','Java REST & OOP'], 'journey.7.text':['Estudos práticos em Java para organizar classes, endpoints, regras e dados.','Practical Java studies to organize classes, endpoints, rules and data.'], 'journey.7.detail':['Inclui projetos de API REST e exercícios de encapsulamento, herança, polimorfismo, composição e organização de código.','Includes REST API projects and exercises in encapsulation, inheritance, polymorphism, composition and code organization.'],
    'journey.8.title':['Cybersecurity Lab','Cybersecurity Lab'], 'journey.8.text':['Laboratórios próprios para estudar redes, segurança de aplicações e automação defensiva.','Personal labs to study networking, application security and defensive automation.'], 'journey.8.detail':['A trilha inclui estudos de port scanning, fundamentos de autenticação, tratamento de erros, logs, criptografia básica e práticas seguras. É estudo prático, não experiência profissional.','The track includes port-scanning studies, authentication fundamentals, error handling, logging, basic cryptography and secure practices. It is practical study, not professional experience.'],
    'journey.9.title':['Tela_A7UL / Jogo de terminal','Tela_A7UL / Terminal Game'], 'journey.9.text':['RPG em Python com combate, exploração, inventário, save system, eventos e áudio.','Python RPG with combat, exploration, inventory, save system, events and audio.'], 'journey.9.detail':['Projeto modular com src/, áudio, múltiplos slots, NG+, bosses, cidades e estrutura de mundo. O arquivo-fonte foi incluído no projeto do portfólio.','Modular project with src/, audio, multiple slots, NG+, bosses, cities and world structure. The source archive is included in the portfolio project.'],
    'journey.10.title':['IMPLACÁVEL Technology','IMPLACÁVEL Technology'], 'journey.10.text':['Trabalho colaborativo de front-end, UX/UI, interações, tema e IA contextual.','Collaborative front-end, UX/UI, interactions, theming and contextual AI work.'], 'journey.10.detail':['Reconstrução e refinamento de um site institucional com linguagem editorial/cyber e componentes interativos.','Reconstruction and refinement of a corporate site with editorial/cyber language and interactive components.'],
    'journey.11.title':['Preparando o próximo salto','Preparing the next jump'], 'journey.11.text':['Buscando estágio/júnior para transformar laboratório e formação em experiência profissional verificável.','Looking for an internship/junior role to turn labs and education into verifiable professional experience.'], 'journey.11.detail':['Próximo passo: aprofundar backend, cloud e segurança em um ambiente profissional, aprender com uma equipe e entregar software útil.','Next step: deepen backend, cloud and security in a professional environment, learn from a team and deliver useful software.'],
    'projects.eyebrow':['03 / PROJETOS','03 / PROJECTS'], 'projects.title':['Onde a ideia<br>vira <em class="crash-accent">software.</em>','Where an idea<br>becomes <em class="crash-accent">software.</em>'], 'projects.subtitle':['Projetos próprios usados para transformar estudo em prática, não apenas em aba de navegador.','Personal projects used to turn study into practice, not just another browser tab.'],
    'filters.all':['TODOS','ALL'], 'filters.backend':['BACKEND','BACKEND'], 'filters.mobile':['MOBILE','MOBILE'], 'filters.automation':['AUTOMAÇÃO','AUTOMATION'], 'filters.security':['SECURITY','SECURITY'], 'filters.game':['GAME','GAME'], 'filters.web':['WEB','WEB'], 'common.details':['VER DETALHES ↗','VIEW DETAILS ↗'],
    'work.eyebrow':['04 / TRABALHOS','04 / WORK'], 'work.title':['Projetos que saem<br>do <em class="crash-accent">laboratório.</em>','Projects that leave<br>the <em class="crash-accent">lab.</em>'], 'work.subtitle':['Uma área separada para trabalhos reais, colaborações e futuros projetos entregues.','A dedicated area for real work, collaborations and future delivered projects.'], 'work.implacavel':['Projeto colaborativo desenvolvido com foco em interface, experiência, interações, identidade e IA contextual.','Collaborative project focused on interface, experience, interactions, identity and contextual AI.'], 'work.open':['ABRIR PROJETO ↗','OPEN PROJECT ↗'], 'work.future':['Novos trabalhos entram aqui com título, objetivo, tecnologia, resultado e link. A estrutura já está pronta para duplicar o card sem quebrar o layout.','New work goes here with title, goal, technology, result and link. The structure is ready to duplicate without breaking the layout.'],
    'stack.eyebrow':['05 / STACK','05 / STACK'], 'stack.title':['As ferramentas<br>por trás do <em class="crash-accent">código.</em>','The tools<br>behind the <em class="crash-accent">code.</em>'], 'stack.subtitle':['Tecnologias usadas nos projetos e assuntos que fazem parte do meu caminho de estudo.','Technologies used in projects and topics that are part of my learning path.'],
    'security.eyebrow':['06 / SEGURANÇA','06 / SECURITY'], 'security.title':['Quando o sistema<br>precisa <em class="crash-accent">ser confiável.</em>','When a system<br>needs to <em>be reliable.</em>'], 'security.subtitle':['Interesse em segurança da informação, redes e boas práticas aplicadas ao desenvolvimento.','Interest in information security, networking and secure practices applied to development.'], 'security.c1.title':['Redes','Networking'], 'security.c1.text':['Fundamentos de TCP/IP, DNS, HTTP/S, conectividade e troubleshooting.','TCP/IP, DNS, HTTP/S, connectivity and troubleshooting fundamentals.'], 'security.c2.title':['Segurança de aplicações','Application security'], 'security.c2.text':['Estudos sobre autenticação, controle de acesso, tratamento de erros, logs e princípios de proteção.','Studies on authentication, access control, error handling, logging and protection principles.'], 'security.c3.title':['Automação defensiva','Defensive automation'], 'security.c3.text':['Uso de scripts e integrações para reduzir tarefas manuais e tornar processos repetíveis.','Using scripts and integrations to reduce manual work and make processes repeatable.'], 'security.note':['ESTUDO PRÁTICO ≠ EXPERIÊNCIA PROFISSIONAL. OS LABORATÓRIOS SÃO APRESENTADOS COMO APRENDIZADO VERIFICÁVEL.','PRACTICAL STUDY ≠ PROFESSIONAL EXPERIENCE. LABS ARE PRESENTED AS VERIFIABLE LEARNING.'], 'security.terminal':['$ inspecionar fundamentos\n> rede .......... TCP/IP · DNS · HTTP/S\n> aplicação ...... autenticação · acesso · validação\n> confiabilidade . logs · erros · backups\n> aprendizado .... conceitos OWASP · hardening básico\n$ próximo: praticar com segurança_','$ inspect fundamentals\n> network ........ TCP/IP · DNS · HTTP/S\n> application .... authentication · access · validation\n> reliability ... logs · errors · backups\n> learning ...... OWASP concepts · basic hardening\n$ next: practice safely_'],
    'lab.eyebrow':['07 / LABORATÓRIO','07 / LAB'], 'lab.title':['Projetos e automações<br>no mesmo <em class="crash-accent">lugar.</em>','Projects and automations<br>in the same <em class="crash-accent">place.</em>'], 'lab.subtitle':['A bancada de testes do portfólio. As funções abaixo usam os endpoints Flask mantidos do projeto original.','The portfolio test bench. These functions use the Flask endpoints preserved from the original project.'], 'lab.faker.title':['Gerador de dados para teste','Test data generator'], 'lab.faker.text':['Cria dados sintéticos e organiza tudo em Excel para testes e protótipos.','Creates synthetic data and organizes it into Excel for testing and prototypes.'], 'lab.quantity':['QUANTIDADE','QUANTITY'], 'lab.whatsapp':['WhatsApp (opcional)','WhatsApp (optional)'], 'lab.apiUrl':['URL da API (opcional)','API URL (optional)'], 'lab.optionalName':['Nome (opcional)','Name (optional)'], 'lab.optionalEmail':['E-mail (opcional)','E-mail (optional)'], 'lab.message':['Mensagem','Message'], 'lab.generate':['GERAR XLSX ↗','GENERATE XLSX ↗'], 'lab.api.title':['Automação por API','API automation'], 'lab.api.text':['Consulta uma API compatível, processa os dados e encaminha o resultado por e-mail.','Queries a compatible API, processes data and sends the result by e-mail.'], 'lab.run':['EXECUTAR AUTOMAÇÃO ↗','RUN AUTOMATION ↗'], 'lab.bot.title':['Bot de conteúdo','Content bot'], 'lab.bot.text':['Prepara uma mensagem e encaminha para integrações disponíveis.','Prepares a message and sends it to available integrations.'], 'lab.send':['ENVIAR MENSAGEM ↗','SEND MESSAGE ↗'], 'lab.rail':['RAIL DE EXECUÇÃO / FLUXO CONTÍNUO','EXECUTION RAIL / CONTINUOUS FLOW'], 'lab.details':['VER DETALHES +','VIEW DETAILS +'], 'lab.d1':['Gera dados sintéticos, organiza em XLSX e baixa pelo endpoint Flask. Útil para testes, protótipos e demonstrações.','Generates synthetic data, packages it as XLSX and downloads it through the Flask endpoint. Useful for tests, prototypes and demos.'], 'lab.d2':['Seleciona uma API e envia os dados para o fluxo /executar, que processa e devolve o resultado.','Selects an API and sends data to the /executar flow, which processes and returns the result.'], 'lab.d3':['Prepara uma mensagem e chama /executar-bot. A integração real depende das credenciais oficiais da plataforma.','Prepares a message and calls /executar-bot. A real integration depends on official platform credentials.'], 'lab.d4':['Base de ETL leve: entrada → tratamento → validação → saída, conectando APIs, Pandas e arquivos.','Light ETL foundation: input → transform → validate → output, connecting APIs, Pandas and files.'], 'lab.d5':['Logs, validação de entrada, controle de acesso e tratamento de erros usados como base para automações mais previsíveis.','Logging, input validation, access control and error handling as the foundation for more predictable automation.'], 'lab.flow.title':['Pipeline de dados','Data pipeline'], 'lab.flow.text':['Estudo aplicado em coleta, tratamento, validação e exportação de dados.','Applied study in data collection, transformation, validation and export.'], 'lab.secure.title':['Automação defensiva','Defensive automation'], 'lab.secure.text':['Estudo de como reduzir tarefas repetitivas preservando rastreabilidade e segurança.','Study of how to reduce repetitive tasks while preserving traceability and security.'],
    'contact.eyebrow':['08 / CONTATO','08 / CONTACT'], 'contact.title':['Vamos transformar<br>uma ideia em <em class="crash-accent">próximo passo.</em>','Let’s turn an idea into the <em class="crash-accent">next step.</em>'], 'contact.subtitle':['Para estágio, projeto, colaboração ou conversa sobre tecnologia. Sem formulário misterioso, sem fumaça.','For an internship, project, collaboration or technology chat. No mystery form, no smoke.'], 'contact.name':['Seu nome','Your name'], 'contact.email':['seu@email.com','your@email.com'], 'contact.subject':['Assunto','Subject'], 'contact.message':['Mensagem','Message'], 'contact.send':['ENVIAR MENSAGEM →','SEND MESSAGE →'], 'contact.note':['O formulário abre seu cliente de e-mail. Nenhum dado é enviado automaticamente sem sua ação.','The form opens your e-mail client. No data is sent automatically without your action.'],
    'footer.tagline':['Construindo com curiosidade, prática e uma quantidade questionável de café.','Building with curiosity, practice and a questionable amount of coffee.'], 'footer.nav':['NAVEGAÇÃO','NAVIGATION'], 'footer.status':['STATUS','STATUS'], 'footer.rights':['Todos os direitos reservados.','All rights reserved.'],
    'ai.subtitle':['ASSISTENTE DO PORTFÓLIO · CONTEXTO DE NEGÓCIO E TECNOLOGIA','PORTFOLIO ASSISTANT · BUSINESS & TECHNOLOGY CONTEXT'], 'ai.empty':['PERGUNTE SOBRE PROJETOS, STACK OU JORNADA','ASK ABOUT PROJECTS, TECH OR THE JOURNEY'], 'ai.s1':['Quero ver os projetos','Show me the projects'], 'ai.s2':['Quais tecnologias você usa?','What technologies do you use?'], 'ai.s3':['O que você estuda em segurança?','What do you study in security?'], 'ai.s4':['Como entrar em contato?','How can I contact you?'], 'ai.placeholder':['Digite uma pergunta...','Type a question...']
  };

  function tr(key){const v=T[key]; return Array.isArray(v)?v[locale==='en'?1:0]:key;}
  function renderI18n(){
    $$('[data-i18n]').forEach(el=>{const key=el.dataset.i18n; el.textContent=tr(key)});
    $$('[data-i18n-html]').forEach(el=>{const key=el.dataset.i18nHtml; el.innerHTML=tr(key)});
    $$('[data-i18n-placeholder]').forEach(el=>{el.placeholder=tr(el.dataset.i18nPlaceholder)});
    html.lang = locale==='en'?'en':'pt-BR';
    document.title = locale==='en' ? 'Fabiano Santos — Developer Full Stack & Cyber' : 'Fabiano Santos — Developer Full Stack & Cyber';
    $('#lang-toggle').textContent=locale==='en'?'EN':'PT';
    const secOut=$('#security-output'); if(secOut){secOut.textContent=tr('security.terminal');}
    const modalDismiss=$('#modal-dismiss'); if(modalDismiss) modalDismiss.textContent=locale==='en'?'CLOSE':'FECHAR';
    const modalClose=$('#modal-close'); if(modalClose) modalClose.setAttribute('aria-label',locale==='en'?'Close':'Fechar');
  }

  // ========================= TEMA DARK / LIGHT =========================
  function applyTheme(){html.classList.toggle('theme-light',theme==='light');html.classList.toggle('theme-dark',theme!=='light');localStorage.setItem('fabiano-theme',theme);$('#theme-toggle').textContent=theme==='light'?'☼':'◐';const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='light'?'#F3F1EA':'#0A0A0A';}
  $('#theme-toggle').addEventListener('click',()=>{theme=theme==='light'?'dark':'light';applyTheme();notify(theme==='light'?'Light mode':'Dark mode');playTone('ui');});

  // ========================= IDIOMA =========================
  $('#lang-toggle').addEventListener('click',()=>{locale=locale==='en'?'pt':'en';localStorage.setItem('fabiano-locale',locale);renderI18n();updateProjectCards();setupTitleCrashEffects(true);notify(locale==='en'?'English enabled':'Português habilitado');playTone('ui');});

  // ========================= MENU / SCROLL SPY =========================
  const nav=$('#main-nav'), mobile=$('#mobile-toggle');
  mobile.addEventListener('click',()=>{const open=nav.classList.toggle('open');mobile.setAttribute('aria-expanded',String(open));mobile.textContent=open?'×':'☰';playTone('ui');});
  $$('#main-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');mobile.setAttribute('aria-expanded','false');mobile.textContent='☰';}));
  const sections=$$('main section[id]');
  const spy=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const link=$(`.main-nav a[href="#${e.target.id}"]`);$$('.main-nav a').forEach(x=>x.classList.remove('active'));link?.classList.add('active');}}),{rootMargin:'-35% 0px -55% 0px',threshold:0});
  sections.forEach(s=>spy.observe(s));

  // ========================= SCROLL / REVEAL =========================
  const progress=$('.scroll-progress span');
  function updateScroll(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?(scrollY/max)*100:0)+'%'}
  addEventListener('scroll',updateScroll,{passive:true}); updateScroll();
  const revealIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealIO.unobserve(e.target)}}),{threshold:.08});
  $$('.reveal').forEach(e=>revealIO.observe(e));

  // ========================= CURSOR TARGET / CYBER HUD V9 =========================
  const cursorTarget=$('#cursor-target');
  let cursorX=-80,cursorY=-80,cursorFrame=null,cursorVisible=false;
  function moveTarget(){
    cursorFrame=null;
    cursorTarget.style.setProperty('--cursor-x',`${cursorX}px`);cursorTarget.style.setProperty('--cursor-y',`${cursorY}px`);cursorTarget.classList.add('is-visible');
  }
  function setTarget(x,y){
    cursorX=x; cursorY=y;
    if(!cursorVisible){cursorVisible=true;document.body.classList.remove('cursor-hidden');}
    if(!cursorFrame)cursorFrame=requestAnimationFrame(moveTarget);
  }
  if(matchMedia('(pointer:fine)').matches){
    document.body.classList.add('custom-cursor');
    addEventListener('pointermove',e=>setTarget(e.clientX,e.clientY),{passive:true});
    addEventListener('pointerleave',()=>{cursorVisible=false;cursorTarget.classList.remove('is-visible');document.body.classList.add('cursor-hidden')});
    addEventListener('pointerenter',e=>setTarget(e.clientX,e.clientY),{passive:true});
  }
  function updateCursorSection(){
    const nodes=$$('main section[id]');
    let best='inicio',bestScore=Infinity;
    for(const sec of nodes){
      const r=sec.getBoundingClientRect();
      const center=Math.abs((r.top+r.height*.42)-innerHeight*.42);
      if(center<bestScore){bestScore=center;best=sec.id;}
    }
    document.body.classList.remove('cursor-security','cursor-journey','cursor-projects','cursor-stack','cursor-lab','cursor-contact');
    if(best==='seguranca')document.body.classList.add('cursor-security');
    else if(best==='jornada')document.body.classList.add('cursor-journey');
    else if(best==='projetos'||best==='trabalhos')document.body.classList.add('cursor-projects');
    else if(best==='stack')document.body.classList.add('cursor-stack');
    else if(best==='laboratorio')document.body.classList.add('cursor-lab');
    else if(best==='contato')document.body.classList.add('cursor-contact');
    const accentMap={inicio:'#B8FF1C',sobre:'#6FD800',jornada:'#B8FF1C',projetos:'#6FD800',trabalhos:'#B8FF1C',stack:'#6FD800',seguranca:'#B8FF1C',laboratorio:'#6FD800',contato:'#B8FF1C'};
    const accent=accentMap[best]||'#B8FF1C';
    document.documentElement.style.setProperty('--cursor-accent',accent);
    document.documentElement.style.setProperty('--scan-accent',accent);
  }
  addEventListener('scroll',updateCursorSection,{passive:true}); updateCursorSection();

  // ========================= TITLE CRASH / DECODE — LOHANE + IMPLACÁVEL =========================
  // O texto original nunca é reescrito: um clone visual temporário faz o decode de símbolos para letras.
  // Como a animação fica em uma camada absoluta, não muda a altura dos cards nem quebra a responsividade.
  let titleCrashObserver = null;
  const activeTitleCrashes = new Map();
  const titleOverlayParents = new WeakMap();
  const TITLE_CRASH_GLYPHS = '▓▒░<>/\\|#@$%?![]{}=+_*01';
  const TITLE_CRASH_SELECTOR = 'h1,h2,h3,h4,h5,h6,.footer-brand';
  const titleMotionReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function acquireTitleOverlayParent(parent) {
    let state = titleOverlayParents.get(parent);
    if (!state) {
      const computedPosition = getComputedStyle(parent).position;
      state = {count: 0, changed: computedPosition === 'static', inlinePosition: parent.style.position};
      if (state.changed) parent.style.position = 'relative';
      titleOverlayParents.set(parent, state);
    }
    state.count += 1;
    return state;
  }

  function releaseTitleOverlayParent(parent) {
    const state = titleOverlayParents.get(parent);
    if (!state) return;
    state.count -= 1;
    if (state.count <= 0) {
      if (state.changed) parent.style.position = state.inlinePosition;
      titleOverlayParents.delete(parent);
    }
  }

  function cleanupTitleCrash(host, state) {
    if (state?.frame) cancelAnimationFrame(state.frame);
    state?.overlay?.remove();
    host.classList.remove('title-crash-source');
    if (state?.parent) releaseTitleOverlayParent(state.parent);
    activeTitleCrashes.delete(host);
  }

  function animateTitleCrash(host, force = false) {
    if (!(host instanceof HTMLElement) || !host.textContent.trim() || titleMotionReduced()) return;
    if (host.classList.contains('title-crash-overlay')) return;
    if (activeTitleCrashes.has(host)) return;
    if (host.dataset.crashPlayed === 'true' && !force) return;

    const parent = host.parentElement;
    if (!parent) return;
    const parentLease = acquireTitleOverlayParent(parent);
    const hostRect = host.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const overlay = host.cloneNode(true);
    overlay.removeAttribute('id');
    overlay.classList.remove('title-crash-source', 'title-crash-overlay');
    overlay.classList.add('title-crash-overlay');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    overlay.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-placeholder]').forEach(node => {
      node.removeAttribute('data-i18n');
      node.removeAttribute('data-i18n-html');
      node.removeAttribute('data-i18n-placeholder');
    });

    // O overlay mantém os mesmos nós de texto e a mesma marcação (<br>, <em>, spans).
    // Só os caracteres da cópia são decodificados; as palavras continuam quebrando normalmente.
    const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT);
    const textRecords = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const original = node.nodeValue || '';
      if (/\S/.test(original)) textRecords.push({node, original, chars: Array.from(original)});
    }

    // O overlay é irmão do título e usa o mesmo contexto CSS, sem entrar no fluxo da página.
    overlay.style.position = 'absolute';
    overlay.style.top = `${hostRect.top - parentRect.top - parent.clientTop + parent.scrollTop}px`;
    overlay.style.left = `${hostRect.left - parentRect.left - parent.clientLeft + parent.scrollLeft}px`;
    overlay.style.width = `${hostRect.width}px`;
    overlay.style.height = `${hostRect.height}px`;
    overlay.style.margin = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '30';
    parent.append(overlay);
    host.classList.add('title-crash-source');

    const totalGlyphs = textRecords.reduce((total, record) => total + record.chars.filter(character => !/\s/.test(character)).length, 0);
    if (!totalGlyphs) {
      host.classList.remove('title-crash-source');
      overlay.remove();
      releaseTitleOverlayParent(parent);
      host.dataset.crashPlayed = 'true';
      return;
    }

    const state = {overlay, parent, parentLease, frame: 0};
    activeTitleCrashes.set(host, state);
    const start = performance.now();
    const duration = Math.min(1250, Math.max(620, totalGlyphs * 7.2));
    let lastNoiseAt = 0;
    let lastFlashAt = 0;
    const randomGlyph = () => TITLE_CRASH_GLYPHS[Math.floor(Math.random() * TITLE_CRASH_GLYPHS.length)];

    const tick = now => {
      if (!activeTitleCrashes.has(host)) return;
      const progress = Math.min(1, (now - start) / duration);
      const decodedCount = Math.floor(Math.pow(progress, 1.12) * totalGlyphs);
      if (now - lastNoiseAt >= 32 || progress >= 1) {
        let globalIndex = 0;
        textRecords.forEach(record => {
          let output = '';
          record.chars.forEach(character => {
            if (/\s/.test(character)) {
              output += character;
              return;
            }
            if (progress >= 1 || globalIndex < decodedCount) output += character;
            else output += Math.random() < (progress < .24 ? .96 : .76) ? randomGlyph() : character;
            globalIndex += 1;
          });
          record.node.nodeValue = output;
        });
        lastNoiseAt = now;
      }
      if (now - lastFlashAt >= 86) {
        overlay.classList.toggle('is-glitching', progress < 1 && Math.random() > .34);
        overlay.style.setProperty('--crash-shift', `${(Math.random() * 4 - 2).toFixed(1)}px`);
        overlay.style.setProperty('--crash-slice-a', `${Math.floor(Math.random() * 22)}%`);
        overlay.style.setProperty('--crash-slice-b', `${Math.floor(Math.random() * 24)}%`);
        lastFlashAt = now;
      }
      if (progress < 1) {
        state.frame = requestAnimationFrame(tick);
      } else {
        textRecords.forEach(record => { record.node.nodeValue = record.original; });
        overlay.classList.remove('is-glitching');
        host.dataset.crashPlayed = 'true';
        cleanupTitleCrash(host, state);
      }
    };
    state.frame = requestAnimationFrame(tick);
  }

  function setupTitleCrashEffects(reset = false) {
    if (titleCrashObserver) titleCrashObserver.disconnect();
    if (reset) {
      [...activeTitleCrashes.entries()].forEach(([host, state]) => cleanupTitleCrash(host, state));
    }
    if (titleMotionReduced() || !('IntersectionObserver' in window)) return;
    const targets = $$(TITLE_CRASH_SELECTOR).filter(el => !el.classList.contains('title-crash-overlay') && !el.closest('.title-crash-overlay') && el.textContent.trim());
    if (reset) targets.forEach(el => { delete el.dataset.crashPlayed; });
    titleCrashObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        titleCrashObserver.unobserve(entry.target);
        animateTitleCrash(entry.target, reset);
      });
    }, {rootMargin: '0px 0px -6% 0px', threshold: 0.08});
    targets.forEach(el => { if (el.dataset.crashPlayed !== 'true') titleCrashObserver.observe(el); });
  }

  // ========================= JORNADA / DETALHES MINIMIZADOS =========================
  $$('.detail-toggle').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const d=$('#'+btn.dataset.detail),card=btn.closest('.timeline-card');const open=!card.classList.contains('open');card.classList.toggle('open',open);d?.classList.toggle('open',open);btn.textContent=open?(locale==='en'?'HIDE −':'OCULTAR −'):(locale==='en'?'DETAILS +':'DETALHES +');playTone('ui')}));
  // ========================= JORNADA V7 / REVEAL SEQUENCIAL =========================
  const journeyItems=$$('#timeline .timeline-item');
  journeyItems.forEach((item,i)=>{if(i>0)item.classList.add('journey-hidden');const btn=item.querySelector('.detail-toggle');btn?.addEventListener('click',()=>{if(i<journeyItems.length-1){const next=journeyItems[i+1];next.classList.remove('journey-hidden');next.classList.add('is-revealed');journeyItems.forEach((it,idx)=>it.classList.toggle('has-next',!it.classList.contains('journey-hidden')&&idx<journeyItems.length-1&&!journeyItems[idx+1].classList.contains('journey-hidden')));setTimeout(()=>next.scrollIntoView({behavior:'smooth',block:'center'}),80)}})});journeyItems.forEach((it,idx)=>it.classList.toggle('has-next',idx===0&&journeyItems.length>1&& !journeyItems[1].classList.contains('journey-hidden')));


  // ========================= PROJETOS / FILTROS / MODAL =========================
  const projectData={
    selic:{tech:'PYTHON · PANDAS · REST API · SMTP',pt:{title:'Automação de Relatórios',summary:'Fluxo de ponta a ponta para coletar, tratar, gerar e entregar dados.',detail:'Integração com API do Banco Central, tratamento com Pandas, geração de CSV/XLSX e envio automatizado por e-mail. Projeto usado como laboratório de automação orientada a problemas reais.',button:'TESTAR NO LAB'},en:{title:'Report Automation',summary:'End-to-end flow to collect, process, generate and deliver data.',detail:'Central Bank API integration, Pandas processing, CSV/XLSX generation and automated e-mail delivery. Built as a practical automation lab.',button:'TEST IN LAB'},link:'#laboratorio'},
    flask:{tech:'FLASK · PYTHON · JAVASCRIPT · APIs',pt:{title:'Plataforma Web de Automação',summary:'Interface web para reunir automações e serviços em um único produto.',detail:'Aplicação Flask com endpoints, formulários, geração de arquivos e integração de serviços. Mantém backend e interface dentro do mesmo fluxo de produto.',button:'ABRIR LAB'},en:{title:'Web Automation Platform',summary:'Web interface that brings automations and services into one product.',detail:'Flask application with endpoints, forms, file generation and service integration. It connects backend and interface inside the same product flow.',button:'OPEN LAB'},link:'#laboratorio'},
    calc:{tech:'KOTLIN · ANDROID · JETPACK COMPOSE · MATERIAL 3',pt:{title:'Calculadora dos Preguiçosos',summary:'App Android para cálculo de médias acadêmicas.',detail:'Calcula NP1, AVA, PIN e Exame, com validação, regras de aprovação, gerenciamento de estado, componentes reutilizáveis, áudio e APK funcional.',button:'BAIXAR APK'},en:{title:'Lazy Calculator',summary:'Android app for academic average calculations.',detail:'Calculates NP1, AVA, PIN and Exam with validation, approval rules, state management, reusable components, audio and a functional APK.',button:'DOWNLOAD APK'},link:'/downloads/calculadora-unip.apk'},
    java:{tech:'JAVA · POO · REST · SQL',pt:{title:'API REST & POO',summary:'Projetos de estudo em Java para construir uma base sólida de backend.',detail:'Inclui API REST e exercícios de orientação a objetos com classes, encapsulamento, herança, polimorfismo, composição e organização de código.',button:'VER JORNADA'},en:{title:'REST API & OOP',summary:'Java study projects building a solid backend foundation.',detail:'Includes REST API work and object-oriented exercises covering classes, encapsulation, inheritance, polymorphism, composition and code organization.',button:'VIEW JOURNEY'},link:'#jornada'},
    oficina:{tech:'PYTHON · TKINTER · SQLITE',pt:{title:'Oficina Digital Manager',summary:'Aplicação desktop para organizar uma rotina operacional.',detail:'Projeto desenvolvido com Python/Tkinter e SQLite para praticar interface, persistência e organização de operações em um software único.',button:'BAIXAR PROJETO'},en:{title:'Oficina Digital Manager',summary:'Desktop application for organizing an operational routine.',detail:'Python/Tkinter + SQLite project used to practice UI, persistence and operational organization in a single application.',button:'DOWNLOAD PROJECT'},link:'/downloads/oficina-manager.zip'},
    rpg:{tech:'PYTHON · POO · JSON · SAVE SYSTEM',pt:{title:'RPG Python',summary:'Jogo de terminal com sistemas progressivos e persistência.',detail:'Combate, exploração, inventário, eventos, lojas, cidades, bosses, save system e NG+. Um projeto para praticar modularização, estados e arquitetura de software.',button:'VER JORNADA'},en:{title:'Python RPG',summary:'Terminal game with progressive systems and persistence.',detail:'Combat, exploration, inventory, events, shops, cities, bosses, save system and NG+. Built to practice modularization, state management and software architecture.',button:'VIEW JOURNEY'},link:'#jornada'},
    cyber:{tech:'PYTHON · NETWORKING · SECURITY FOUNDATIONS',pt:{title:'Cybersecurity Lab',summary:'Laboratórios de estudo em redes, troubleshooting e segurança.',detail:'Coleção de estudos práticos em fundamentos de redes, port scanning, tratamento de erros, autenticação, logs, criptografia básica e automação. Os materiais não são apresentados como experiência profissional.',button:'VER SEGURANÇA'},en:{title:'Cybersecurity Lab',summary:'Study labs in networking, troubleshooting and security.',detail:'Practical studies in network fundamentals, port scanning, error handling, authentication, logging, basic cryptography and automation. The material is not presented as professional experience.',button:'VIEW SECURITY'},link:'#seguranca'},
    tela:{tech:'PYTHON · PYGAME · JSON · PERSISTÊNCIA',pt:{title:'Tela_A7UL',summary:'RPG modular inspirado em terminal/cyber.',detail:'Projeto com combate por turnos, inventário, save system, áudio, eventos, cidades, bosses e NG+. O material-fonte fornecido está no diretório projetos/tela_a7ul e o arquivo compactado está em downloads/.',button:'BAIXAR FONTE'},en:{title:'Tela_A7UL',summary:'Terminal/cyber-inspired modular RPG.',detail:'Project with turn-based combat, inventory, save system, audio, events, cities, bosses and NG+. The provided source is in projetos/tela_a7ul and the archive is in downloads/.',button:'DOWNLOAD SOURCE'},link:'/downloads/Tela_A7UL_PY_v1.0_source.zip'}
  };
  function updateProjectCards(){
    $$('[data-project-title]').forEach(el=>{const id=el.closest('.project-card').dataset.project,d=projectData[id];if(d)el.textContent=d[locale].title});
    $$('[data-project-summary]').forEach(el=>{const id=el.closest('.project-card').dataset.project,d=projectData[id];if(d)el.textContent=d[locale].summary});
    renderI18n();
  }
  $$('#project-filters .filter').forEach(btn=>btn.addEventListener('click',()=>{const f=btn.dataset.filter;$$('#project-filters .filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$$('.project-card').forEach(card=>{const show=f==='all'||card.dataset.tags.split(' ').includes(f);card.classList.toggle('hidden',!show)});playTone('ui');}));
  const modal=$('#project-modal');
  function openProject(id){const d=projectData[id];if(!d)return;const lang=locale==='en'?'en':'pt';$('#modal-kicker').textContent='PROJECT / '+id.toUpperCase();$('#modal-tech').textContent=d.tech;$('#modal-title').textContent=d[lang].title;$('#modal-summary').textContent=d[lang].summary;$('#modal-detail').textContent=d[lang].detail;const a=$('#modal-link');a.href=d.link;a.textContent=d[lang].button+' ↗';a.style.display=d.link?'inline-flex':'none';a.onclick=null;a.removeAttribute('download');if(d.link.startsWith('#')){a.target='_self';a.onclick=(event)=>{event.preventDefault();const selector=d.link;modal.close();history.replaceState(null,'',selector);setTimeout(()=>$(selector)?.scrollIntoView({behavior:'smooth',block:'start'}),80);};}else if(d.link.startsWith('/downloads/')){a.target='_self';a.setAttribute('download','');}else{a.target='_blank';a.rel='noreferrer noopener';}modal.showModal();document.body.classList.add('project-modal-open');animateTitleCrash($('#modal-title'),true);playTone('ui');}
  $$('.project-card').forEach(card=>card.addEventListener('click',()=>openProject(card.dataset.project)));
  $('#modal-close').addEventListener('click',()=>modal.close());$('#modal-dismiss').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>document.body.classList.remove('project-modal-open'));modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});

  // ========================= STACK / TERMINAL INTERATIVO =========================
  const stackMeta={Python:'backend · APIs · automation · data',Java:'OOP · REST · JVM studies',Kotlin:'Android · Compose · JVM',SQL:'queries · relational data',JavaScript:'web · interactions · UI','HTML/CSS':'interfaces · responsive web',Flask:'Python · web backend',Pandas:'data processing · reports','Git/GitHub':'versioning · collaboration',PostgreSQL:'relational database','REST APIs':'integration · services','Jetpack Compose':'Android UI · components',Tkinter:'desktop · Python',JSON:'persistence · API exchange',Linux:'security fundamentals',Docker:'container fundamentals','Power BI':'analysis · dashboards',Photoshop:'creative · visual','Node.js':'JavaScript backend · services',TypeScript:'typed web · frontend','C++':'algorithms · systems fundamentals',Figma:'UI · prototyping','Nmap':'network study · discovery',OWASP:'secure development principles'};
  $$('.stack-chip').forEach(chip=>chip.addEventListener('click',()=>{const name=chip.dataset.stack;$$('.stack-chip').forEach(x=>x.classList.remove('active'));chip.classList.add('active');$('#stack-output').textContent=`$ inspect ${name.toLowerCase()}\n> status: practice\n> context: ${stackMeta[name]||'portfolio'}\n> mode: ${locale==='en'?'practice / study':'prática / estudo'}\n> next: use in a real project`;playTone('ui');}));
  // ========================= STACK ICON FALLBACK =========================
  $$('img.stack-logo').forEach(img=>{const fallback=img.parentElement?.querySelector('.stack-fallback'); if(!fallback)return; img.addEventListener('load',()=>fallback.style.display='none',{once:true}); img.addEventListener('error',()=>{img.style.display='none';fallback.style.display='grid'},{once:true}); if(img.complete && img.naturalWidth>0)fallback.style.display='none';});

  // ========================= LAB V8 / VERTICAL FLOW =========================
  $$('.lab-detail-toggle').forEach(btn=>btn.addEventListener('click',()=>{const d=$('#'+btn.dataset.labDetail);if(!d)return;const open=!d.classList.contains('open');d.classList.toggle('open',open);btn.textContent=open?(locale==='en'?'HIDE −':'OCULTAR −'):(locale==='en'?'VIEW DETAILS +':'VER DETALHES +');playTone('ui')}));

  // ========================= LAB / FORMULÁRIOS =========================
  async function postForm(form,status,url,expectBlob=false){const btn=form.querySelector('button[type="submit"]');const old=btn.textContent;btn.disabled=true;btn.textContent='...';status.textContent=locale==='en'?'Processing...':'Processando...';try{const r=await fetch(url,{method:'POST',body:new FormData(form)});if(!r.ok){const text=await r.text();let errorData=null;try{errorData=JSON.parse(text)}catch{}throw new Error(errorData?.mensagem||errorData?.message||`Request failed (${r.status})`)}if(expectBlob)return {r,data:null};const text=await r.text();let data=null;try{data=JSON.parse(text)}catch{}return {r,data};}catch(err){throw err}finally{btn.disabled=false;btn.textContent=old}}
  $('#fake-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,status=$('#fake-status');try{const {r}=await postForm(form,status,'/gerar-dados',true);const blob=await r.blob();const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='dados_falsos_organizados.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);status.textContent=locale==='en'?'File generated and downloaded.':'Arquivo gerado e baixado.';playTone('success');}catch(err){status.textContent=err.message|| (locale==='en'?'Could not generate the file.':'Não foi possível gerar o arquivo.');playTone('error')}});
  $('#automation-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,status=$('#automation-status');status.replaceChildren();try{const {data}=await postForm(form,status,'/executar');status.textContent=data?.mensagem||'OK';if(data?.download_url){const link=document.createElement('a');link.href=data.download_url;link.className='form-download-link';link.textContent=locale==='en'?'Download processed XLSX':'Baixar XLSX processado';link.style.display='inline-block';link.style.marginLeft='10px';link.style.color='var(--accent)';link.style.textDecoration='underline';link.setAttribute('download','');status.append(document.createTextNode(' '),link);}playTone(data?.email_enviado===false?'ui':'success')}catch(err){status.textContent=err.message||'Falha na automação.';playTone('error')}});
  $('#bot-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,status=$('#bot-status');try{const {data}=await postForm(form,status,'/executar-bot');status.textContent=data?.mensagem||'OK';playTone('success')}catch(err){status.textContent=err.message;playTone('error')}});
  $('#contact-form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const name=f.get('nome'),email=f.get('email'),subject=f.get('assunto')||'Contato pelo portfólio',msg=f.get('mensagem');const body=encodeURIComponent(`${msg}\n\nNome: ${name}\nE-mail: ${email}`);location.href=`mailto:fcs.ti01@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;$('#contact-status').textContent=locale==='en'?'Opening your e-mail client...':'Abrindo seu cliente de e-mail...';playTone('success')});

  // ========================= SOCIAL CONFIGURÁVEL =========================
  $$('[data-configurable]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();const key=btn.dataset.configurable,url=SITE_CONFIG.social[key];if(url){window.open(url,'_blank','noopener,noreferrer')}else{notify(locale==='en'?`${key} is ready to configure in site-config.js.`:`${key} está pronto para configurar no site-config.js.`);}}));

  // ========================= SOM RETRÔ / CYBER CHILL =========================
  function ensureAudio(){if(!audioCtx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;audioCtx=new C()}if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
  function playTone(kind='ui'){if(!soundOn)return;const c=ensureAudio();if(!c)return;const now=c.currentTime;const seq=kind==='success'?[523.25,659.25,783.99]:kind==='error'?[220,196,174]:[392,523.25,659.25];seq.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.setValueAtTime(f,now+i*.075);g.gain.setValueAtTime(.018,now+i*.075);g.gain.exponentialRampToValueAtTime(.0001,now+i*.075+.065);o.connect(g).connect(c.destination);o.start(now+i*.075);o.stop(now+i*.075+.07)})}
  $('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;localStorage.setItem('fabiano-sound',soundOn?'1':'0');$('#sound-toggle').textContent=soundOn?'♫':'♪';$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));if(soundOn)playTone('success');notify(soundOn?(locale==='en'?'Retro sound on':'Som retrô ligado'):(locale==='en'?'Retro sound off':'Som retrô desligado'))});
  $('#sound-toggle').textContent=soundOn?'♫':'♪';$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));

  // ========================= FABIANO AI / CYBER ASSISTANT =========================
  const aiShell=$('#ai-shell'),aiBody=$('#ai-body'),aiInput=$('#ai-input');
  const aiKnowledge={
    profile:{pt:'Fabiano é estudante de Ciência da Computação na UNIP, com foco atual em backend, automação, dados e fundamentos de segurança.',en:'Fabiano is a Computer Science student at UNIP, currently focused on backend, automation, data and security foundations.'},
    projects:{pt:'Os projetos incluem automação de relatórios com Python/Pandas/API, plataforma Flask, Calculadora dos Preguiçosos em Kotlin/Android, estudos Java REST/POO, RPG em Python, Tela_A7UL e laboratórios de segurança.',en:'Projects include Python/Pandas/API report automation, a Flask platform, the Lazy Calculator in Kotlin/Android, Java REST/OOP studies, a Python RPG, Tela_A7UL and security labs.'},
    stack:{pt:'A stack principal é Python, Java, Kotlin, SQL, JavaScript, HTML/CSS, Flask, Pandas, PostgreSQL, REST APIs, Git/GitHub, Jetpack Compose e Docker em fundamentos.',en:'The core stack is Python, Java, Kotlin, SQL, JavaScript, HTML/CSS, Flask, Pandas, PostgreSQL, REST APIs, Git/GitHub, Jetpack Compose and Docker fundamentals.'},
    security:{pt:'Os estudos de segurança cobrem TCP/IP, DNS, HTTP/S, troubleshooting, autenticação, controle de acesso, logs, validação de entrada, criptografia básica, OWASP e automação defensiva. São estudos, não experiência profissional.',en:'Security studies cover TCP/IP, DNS, HTTP/S, troubleshooting, authentication, access control, logging, input validation, basic cryptography, OWASP and defensive automation. They are studies, not professional experience.'},
    journey:{pt:'A progressão começa em operações digitais e e-commerce, passa pelo início da graduação em 25/02/2025, Snake em Kotlin, Calculadora dos Preguiçosos, automação com APIs, Flask, Java, segurança, Tela_A7UL e trabalhos colaborativos.',en:'The path starts in digital operations and e-commerce, moves through Computer Science started on Feb 25, 2025, Snake in Kotlin, Lazy Calculator, API automation, Flask, Java, security, Tela_A7UL and collaborative work.'},
    work:{pt:'Trabalhos colaborativos incluem a IMPLACÁVEL Technology, com front-end, UX/UI, interações, identidade visual e IA contextual.',en:'Collaborative work includes IMPLACÁVEL Technology, with front-end, UX/UI, interactions, visual identity and contextual AI.'},
    contact:{pt:'Contato: fcs.ti01@gmail.com, LinkedIn, GitHub e WhatsApp. Facebook e Instagram podem ser configurados no site-config.js.',en:'Contact: fcs.ti01@gmail.com, LinkedIn, GitHub and WhatsApp. Facebook and Instagram can be configured in site-config.js.'},
    career:{pt:'O próximo objetivo é estágio/júnior em backend, automação e/ou segurança, com foco em transformar projetos verificáveis em experiência profissional.',en:'The next goal is an internship/junior role in backend, automation and/or security, turning verifiable projects into professional experience.'}
  };
  function detectLanguage(msg){const m=msg.toLowerCase();const en=(m.match(/\b(the|what|how|where|when|which|can|could|please|hello|hi|hey|good|need|want|you|your|project|projects|technology|technologies|security|contact|about|work|experience|career|skills|stack|journey|price)\b/g)||[]).length;const pt=(m.match(/\b(oi|olá|ola|como|onde|quando|qual|pode|por|favor|bom|boa|quero|preciso|você|seu|sua|projeto|projetos|tecnologia|tecnologias|segurança|contato|sobre|trabalho|experiência|faculdade|jornada|carreira|habilidades|stack|preço|quanto)\b/g)||[]).length;return en>pt?'en':'pt'}
  function intent(msg){const m=msg.toLowerCase();if(/\b(oi|olá|ola|hello|hi|hey|bom dia|boa tarde|boa noite|good morning|good afternoon|good evening)\b/.test(m))return'greeting';if(/sobre você|sobre o fabiano|about you|who are you|quem é você|who is fabiano|perfil|profile/.test(m))return'profile';if(/projeto|project|github|apk|rpg|snake|calculadora|flask|tela|portfolio|portfólio/.test(m))return'projects';if(/tecnologia|stack|python|java|kotlin|sql|javascript|react|typescript|docker|linux|pandas|api|database|banco/.test(m))return'stack';if(/segurança|seguranca|security|cyber|tcp|dns|cript|rede|network|firewall|auth|hardening|owasp|nmap/.test(m))return'security';if(/faculdade|universidade|unip|curso|education|college/.test(m))return'education';if(/estágio|estagio|junior|júnior|intern|job|career|vaga|carreira/.test(m))return'career';if(/contato|contact|email|e-mail|whatsapp|linkedin|instagram|facebook/.test(m))return'contact';if(/e-commerce|mercado livre|amazon|shopee|marketplace|logística|logistica/.test(m))return'ecommerce';if(/implac[aá]vel|collab|trabalho/.test(m))return'work';if(/jornada|caminho|história|historia|timeline|progress|trajetória|trajectory/.test(m))return'journey';if(/ajuda|help|o que você pode fazer|what can you do|skills|habilidades|competenc/.test(m))return'profile';if(/obrigad|thanks|thank you|valeu|thank/.test(m))return'thanks';return null}
  function naturalGreeting(lang){return lang==='en'?'Hello. How can I help?':'Olá. Como posso ajudar?'}
  function addAI(text,role='bot'){const empty=$('#ai-empty-state');if(empty)empty.hidden=true;const el=document.createElement('div');el.className='ai-message '+role;el.textContent=text;aiBody.appendChild(el);aiBody.scrollTop=aiBody.scrollHeight;aiHistory.push({role,text})}
  function showTyping(){const el=document.createElement('div');el.className='ai-typing';el.innerHTML='<i></i><i></i><i></i>';aiBody.appendChild(el);aiBody.scrollTop=aiBody.scrollHeight;return el}
  const aiProjectFacts={
    snake:{pt:'Snake em Kotlin foi um dos primeiros projetos em que a lógica passou a virar uma aplicação executável, trabalhando estados, entrada do usuário e regras de jogo.',en:'Snake in Kotlin was one of the first projects where logic became an executable application, working with state, user input and game rules.'},
    calculadora:{pt:'A Calculadora dos Preguiçosos é um app Android em Kotlin para calcular NP1, AVA, PIN e Exame, com validação e regras acadêmicas. Há APK funcional no portfólio.',en:'The Lazy Calculator is an Android app in Kotlin for NP1, AVA, PIN and Exam calculations, with validation and academic rules. A functional APK is included in the portfolio.'},
    selic:{pt:'A Automação de Relatórios integra uma API, trata dados com Pandas, gera CSV/XLSX e envia informações por e-mail via SMTP.',en:'Report Automation integrates an API, processes data with Pandas, generates CSV/XLSX files and sends information by e-mail via SMTP.'},
    flask:{pt:'A Plataforma Web de Automação usa Flask para reunir formulários, endpoints, geração de arquivos e serviços em um mesmo produto.',en:'The Web Automation Platform uses Flask to bring forms, endpoints, file generation and services into one product.'},
    tela:{pt:'Tela_A7UL é um projeto de jogo de terminal em Python com combate, exploração, inventário, persistência, eventos e áudio. O portfólio disponibiliza o fonte.',en:'Tela_A7UL is a Python terminal game project with combat, exploration, inventory, persistence, events and audio. The portfolio includes its source package.'}
  };
  function specificProjectKey(msg){const m=msg.toLowerCase();if(/snake/.test(m))return 'snake';if(/calculadora|preguiçosos|preguiçoso|lazy calculator/.test(m))return 'calculadora';if(/selic|relat[óo]rio|report automation|banco central/.test(m))return 'selic';if(/flask|plataforma web/.test(m))return 'flask';if(/tela_a7ul|tela azul|jogo de terminal/.test(m))return 'tela';return null}

  async function getAIReply(msg){const langDetect=detectLanguage(msg);const chosen=intent(msg);const priorUser=[...aiHistory].reverse().find(x=>x.role==='user')?.text||'';
    const projectKey=specificProjectKey(msg);
    if(projectKey&&aiProjectFacts[projectKey])return aiProjectFacts[projectKey][langDetect];
    if(SITE_CONFIG.aiEndpoint){try{const r=await fetch(SITE_CONFIG.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,language:langDetect,history:aiHistory.slice(-12),context:'Fabiano portfolio; answer accurately, never invent experience, distinguish study from professional work'})});if(r.ok){const d=await r.json();if(d.reply||d.message)return d.reply||d.message}}catch(_){} }
    if(chosen==='greeting')return langDetect==='en'?'Hi! I’m Fabiano AI. Ask me about Fabiano, projects, technologies, security studies, the journey or contact.':'Oi! Eu sou a Fabiano AI. Pergunte sobre o Fabiano, projetos, tecnologias, estudos de segurança, jornada ou contato.';
    if(chosen==='thanks')return langDetect==='en'?'You’re welcome. Keep exploring the portfolio; you can ask for a project breakdown, the stack, the journey or contact details.':'Por nada. Continue explorando o portfólio; você pode pedir detalhes de um projeto, da stack, da jornada ou de como entrar em contato.';
    if(chosen==='education')return langDetect==='en'?'Fabiano started Computer Science at UNIP on February 25, 2025. The degree is the formal layer supporting his practical work in programming, databases, software design and systems.':'Fabiano iniciou Ciência da Computação na UNIP em 25 de fevereiro de 2025. A graduação é a base formal que sustenta a prática em programação, banco de dados, engenharia de software e sistemas.';
    if(chosen==='ecommerce')return langDetect==='en'?'His professional foundation is digital operations and e-commerce: marketplaces, customer service, ads, logistics, data, troubleshooting and process continuity.':'A base profissional dele está em operações digitais e e-commerce: marketplaces, atendimento, anúncios, logística, dados, troubleshooting e continuidade de processos.';
    if(chosen==='career')return langDetect==='en'?'The current direction is internship/junior work in backend, automation and security. The portfolio is being used as evidence of practical learning rather than as a substitute for professional experience.':'A direção atual é estágio/júnior em backend, automação e segurança. O portfólio serve como evidência de prática e aprendizado, não como substituto de experiência profissional.';
    if(chosen==='contact')return langDetect==='en'?'You can contact Fabiano by email at fcs.ti01@gmail.com, or use LinkedIn, GitHub and WhatsApp. The social links are at the end of the portfolio.':'Você pode falar com o Fabiano pelo e-mail fcs.ti01@gmail.com ou usar LinkedIn, GitHub e WhatsApp. Os links sociais ficam no final do portfólio.';
    if(chosen==='work')return langDetect==='en'?'The portfolio includes collaborative work such as IMPLACÁVEL Technology, involving front-end, UX/UI, interaction design and contextual AI.':'O portfólio inclui trabalhos colaborativos como a IMPLACÁVEL Technology, envolvendo front-end, UX/UI, interações e IA contextual.';
    if(chosen&&aiKnowledge[chosen])return aiKnowledge[chosen][langDetect];
    if(/^(why|por que|porque|why is|porquê)/i.test(msg))return langDetect==='en'?'Because each section represents a practical layer: operations, formal study, software projects, stack, security and the next professional step.':'Porque cada seção representa uma camada prática: operações, formação, projetos de software, stack, segurança e o próximo salto profissional.';
    if(/mais|more|detalhe|details|explain|explica|tell me|continue|continua/i.test(msg)&&priorUser)return langDetect==='en'?`Let’s go deeper on “${priorUser}”. I can break it down into objective, technologies, what was actually implemented and what is still study.`:`Vamos aprofundar “${priorUser}”. Posso separar objetivo, tecnologias, o que foi realmente implementado e o que ainda é estudo.`;
    return langDetect==='en'?'I can answer about Fabiano, his journey, projects, technologies, security studies, IMPLACÁVEL work, laboratory or contact. Ask one topic and I’ll keep the answer tied to the portfolio.':'Posso responder sobre o Fabiano, jornada, projetos, tecnologias, estudos de segurança, trabalho na IMPLACÁVEL, laboratório ou contato. Pergunte um tema e eu mantenho a resposta presa ao contexto do portfólio.'
  }

  function openAI(){aiShell.classList.add('open');aiInput.focus();} function closeAI(){aiShell.classList.remove('open')}
  $('#ai-launcher').addEventListener('click',openAI);$('#ai-close').addEventListener('click',closeAI);
  $$('#ai-suggestions button').forEach(btn=>btn.addEventListener('click',async()=>{const key=btn.dataset.ai;const text=btn.textContent;addAI(text,'user');$('.ai-suggestions').style.display='none';const map={projects:'projects',stack:'stack',security:'security',contact:'contact'};const typing=showTyping();setTimeout(async()=>{const reply=(aiKnowledge[map[key]]?.[locale==='en'?'en':'pt'])||await getAIReply(text);typing.remove();addAI(reply,'bot');playTone('ui')},120)}));
  $('#ai-form').addEventListener('submit',async e=>{e.preventDefault();const msg=aiInput.value.trim();if(!msg)return;addAI(msg,'user');aiInput.value='';$('.ai-suggestions').style.display='none';const typing=showTyping();setTimeout(async()=>{const reply=await getAIReply(msg);typing.remove();addAI(reply,'bot');playTone('ui')},140)});

  // ========================= MICROINTERAÇÕES / HOVER SOUND =========================
  const canFine=matchMedia('(pointer:fine)').matches;
  if(canFine){$$('a,button,.stack-chip,.project-card').forEach(el=>el.addEventListener('mouseenter',()=>playTone('ui')))}

  // ========================= BOOTSTRAP FINAL =========================
  applyTheme(); renderI18n(); updateProjectCards(); setupTitleCrashEffects();
  $('#current-year').textContent=new Date().getFullYear();
  $('#back-top').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  function notify(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove('show'),1600)}
})();
