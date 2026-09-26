// ==========================================================================
// VISIOFLOW MEDIA - ENGINE DE TRANSMISSÃO, TELEMETRIA & CLIMA ULTRA-LUXO
// ==========================================================================

// 1. WAKE LOCK API 2.0 (IMPEDE A SMART TV DE APAGAR A TELA)
let wakeLockSentinel = null;

async function ativarWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLockSentinel = await navigator.wakeLock.request('screen');
            console.log('[VisioFlow] Wake Lock Ativo: Tela bloqueada contra suspensão.');
        }
    } catch (err) {
        console.log('[VisioFlow] Wake Lock não disponível ou negado:', err);
    }
}

document.addEventListener('visibilitychange', async () => {
    if (wakeLockSentinel !== null && document.visibilityState === 'visible') {
        await ativarWakeLock();
    }
});

// 2. MOTOR DO WORLD CLOCK (COM DIFERENÇA EM RELAÇÃO A BRASÍLIA)
function atualizarRelogiosMundiais() {
    const agora = new Date();

    // 1. Brasília / Belém (UTC-3)
    const optionsBrasilia = { timeZone: 'America/Belem', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const horaBrasiliaCompleta = agora.toLocaleTimeString('pt-BR', optionsBrasilia);
    const partesBrasilia = horaBrasiliaCompleta.split(':');
    
    const elBrasilia = document.getElementById('clock-brasilia');
    if (elBrasilia) {
        elBrasilia.innerHTML = `${partesBrasilia[0]}:${partesBrasilia[1]}<span class="clock-segundos">:${partesBrasilia[2]}</span>`;
    }

    const optionsData = { timeZone: 'America/Belem', weekday: 'long', day: 'numeric', month: 'long' };
    const dataExtenso = agora.toLocaleDateString('pt-BR', optionsData);
    const elData = document.getElementById('clock-brasilia-data');
    if (elData) {
        elData.innerText = dataExtenso.charAt(0).toUpperCase() + dataExtenso.slice(1);
    }

    // 2. Nova York
    formatarHoraCidade('clock-ny', 'America/New_York');

    // 3. Londres
    formatarHoraCidade('clock-london', 'Europe/London');

    // 4. Dubai
    formatarHoraCidade('clock-dubai', 'Asia/Dubai');

    // 5. Tóquio
    formatarHoraCidade('clock-tokyo', 'Asia/Tokyo');
}

function formatarHoraCidade(elementId, timeZone) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const hora = new Date().toLocaleTimeString('pt-BR', { timeZone: timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
    el.innerText = hora;
}

setInterval(atualizarRelogiosMundiais, 1000);

// 3. AUDITORIA & PROVA DE EXIBIÇÃO (PROOF OF PLAY - LOCALSTORAGE)
const STORAGE_KEY = 'visioflow_proof_of_play';

function registrarAuditoria(tipo) {
    let metricas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        total_ciclos_completos: 0,
        exibicoes_video_salao: 0,
        exibicoes_video_anuncio: 0,
        exibicoes_video_produto: 0,
        primeira_execucao: new Date().toLocaleString('pt-BR'),
        ultima_atualizacao: null
    };

    if (tipo === 'salao') metricas.exibicoes_video_salao++;
    if (tipo === 'anuncio') metricas.exibicoes_video_anuncio++;
    if (tipo === 'produto_salao') metricas.exibicoes_video_produto++;
    if (tipo === 'ciclo_fechado') metricas.total_ciclos_completos++;

    metricas.ultima_atualizacao = new Date().toLocaleString('pt-BR');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metricas));
}

// 4. GESTO SECRETO: 3 TOQUES NA LOGO ABREM O HUD EXECUTIVO
let contadorCliquesLogo = 0;
let timerCliqueLogo = null;

function registrarCliqueLogo() {
    contadorCliquesLogo++;
    clearTimeout(timerCliqueLogo);

    timerCliqueLogo = setTimeout(() => {
        contadorCliquesLogo = 0;
    }, 1000);

    if (contadorCliquesLogo >= 3) {
        contadorCliquesLogo = 0;
        abrirHUD();
    }
}

function abrirHUD() {
    const metricas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        total_ciclos_completos: 0,
        exibicoes_video_salao: 0,
        exibicoes_video_anuncio: 0,
        exibicoes_video_produto: 0,
        primeira_execucao: '--'
    };

    document.getElementById('hud-ciclos').innerText = metricas.total_ciclos_completos;
    document.getElementById('hud-salao').innerText = metricas.exibicoes_video_salao;
    document.getElementById('hud-keune').innerText = metricas.exibicoes_video_anuncio;
    document.getElementById('hud-loreal').innerText = metricas.exibicoes_video_produto;
    document.getElementById('hud-inicio').innerText = metricas.primeira_execucao;

    document.getElementById('hud-auditoria').classList.add('ativo');
}

function fecharHUD() {
    document.getElementById('hud-auditoria').classList.remove('ativo');
}

function zerarMetricas() {
    if (confirm("Deseja zerar as métricas de exibição da tela?")) {
        localStorage.removeItem(STORAGE_KEY);
        abrirHUD();
    }
}

// 5. FALLBACKS DE LOGO E IMAGENS
function aplicarLogoSVG(elementoImg) {
    elementoImg.style.display = 'none';
    const container = elementoImg.parentElement;
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 3.2rem; font-weight: 900; background: var(--ouro-gradiente); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1;">MS</div>
            <div style="font-size: 1.3rem; font-weight: 700; letter-spacing: 5px; background: var(--ouro-gradiente); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">MANOEL SANTOS</div>
            <div style="font-size: 0.75rem; letter-spacing: 6px; color: var(--ouro-primario); font-weight: 300;">STUDIO EXPRESSO</div>
        </div>
    `;
}

function tratarErroImagem(img) {
    img.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80';
}

function tratarErroImagemAgenda(img) {
    img.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80';
}

// 6. MOTOR METEOROLÓGICO DE ALTA PRECISÃO (OPEN-METEO COM EFEITOS DINÂMICOS)
async function carregarPrevisaoBelem() {
    try {
        const opcoesData = { weekday: 'long', day: 'numeric', month: 'short' };
        const dataHojeFormatada = new Date().toLocaleDateString('pt-BR', opcoesData);
        document.getElementById('clima-data-hoje').innerText = `${dataHojeFormatada} • Belém, PA`;

        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-1.4558&longitude=-48.4902&current=temperature_2m,apparent_temperature,is_day,weather_code,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,is_day,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FBelem';
        const res = await fetch(url);
        const dados = await res.json();

        const tempAtual = Math.round(dados.current.temperature_2m);
        const sensacao = Math.round(dados.current.apparent_temperature);
        const umidade = dados.current.relative_humidity_2m;
        const vento = Math.round(dados.current.wind_speed_10m);
        const codeAtual = dados.current.weather_code;
        const isDayAtual = dados.current.is_day;

        const maxHoje = Math.round(dados.daily.temperature_2m_max[0]);
        const minHoje = Math.round(dados.daily.temperature_2m_min[0]);
        const chuvaHoje = dados.daily.precipitation_probability_max[0] || 30;

        document.getElementById('temp-agora').innerHTML = `${tempAtual}<span>°C</span>`;
        document.getElementById('condicao-agora').innerText = traduzirClimaComPeriodo(codeAtual, isDayAtual).texto;
        document.getElementById('temp-hoje-max').innerText = maxHoje;
        document.getElementById('temp-hoje-min').innerText = minHoje;

        document.getElementById('clima-sensacao').innerText = `${sensacao}°C`;
        document.getElementById('clima-chuva-hoje').innerText = `${chuvaHoje}%`;
        document.getElementById('clima-umidade-hoje').innerText = `${umidade}%`;
        document.getElementById('clima-vento-hoje').innerText = `${vento} km/h`;

        // Renderiza o Cenário Dinâmico
        renderizarCenarioAtmosferico(codeAtual, isDayAtual);

        // Previsão Horária em Glassmorphism
        const horaAtual = new Date().getHours();
        const containerHoras = document.getElementById('container-horas-capsula');
        containerHoras.innerHTML = '';

        let adicionados = 0;
        for (let i = horaAtual + 2; i < horaAtual + 10 && adicionados < 4; i += 2) {
            if (dados.hourly.time[i]) {
                const tempHora = Math.round(dados.hourly.temperature_2m[i]);
                const codeHora = dados.hourly.weather_code[i];
                const isDayHora = dados.hourly.is_day[i];
                const infoHora = traduzirClimaComPeriodo(codeHora, isDayHora);
                const horaFormatada = `${String(i % 24).padStart(2, '0')}:00`;

                containerHoras.innerHTML += `
                    <div class="hora-item">
                        <span>${horaFormatada}</span>
                        <div class="emoji">${infoHora.icone}</div>
                        <span>${tempHora}°</span>
                    </div>
                `;
                adicionados++;
            }
        }
    } catch (err) {
        console.error("Falha ao sincronizar clima:", err);
    }
}

// RENDERIZADOR DA NOVA ATMOSFERA (SOL, LUA, NUVENS, PÔR DO SOL OU CHUVA)
function renderizarCenarioAtmosferico(codigo, isDay) {
    const cenario = document.getElementById('cenario-clima');
    cenario.innerHTML = '';

    const horaAtual = new Date().getHours();
    const minutos = new Date().getMinutes();
    const horarioDecimal = horaAtual + (minutos / 60);

    // 1. CHUVA
    if (codigo >= 51) {
        cenario.style.background = 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)';
        gerarNuvens(6, 'nuvem-cinza');
        for (let i = 0; i < 40; i++) {
            const gota = document.createElement('div');
            gota.className = 'gota';
            gota.style.left = `${Math.random() * 100}%`;
            gota.style.animationDelay = `${Math.random() * 1}s`;
            cenario.appendChild(gota);
        }
        return;
    }

    // 2. FIM DE TARDE / PÔR DO SOL EM BELÉM (Entre 17:30 e 18:35)
    if (horarioDecimal >= 17.5 && horarioDecimal <= 18.6) {
        cenario.style.background = 'linear-gradient(180deg, #4C1D95 0%, #E11D48 40%, #F59E0B 100%)';
        cenario.innerHTML = '<div class="sol-poente"></div>';
        gerarNuvens(5, 'nuvem-rosada');
        return;
    }

    // 3. NOITE (isDay === 0)
    if (isDay === 0) {
        cenario.style.background = 'linear-gradient(180deg, #020617 0%, #0F172A 100%)';
        cenario.innerHTML = '<div class="lua"></div>';
        for (let i = 0; i < 30; i++) {
            const estrela = document.createElement('div');
            estrela.className = 'estrela';
            estrela.style.width = `${2 + Math.random() * 3}px`;
            estrela.style.height = estrela.style.width;
            estrela.style.top = `${Math.random() * 55}%`;
            estrela.style.left = `${Math.random() * 100}%`;
            estrela.style.animationDelay = `${Math.random() * 3}s`;
            cenario.appendChild(estrela);
        }
        return;
    }

    // 4. DIA ENSOLARADO OU COM NUVENS (isDay === 1)
    if (codigo === 0) {
        // Céu Limpo
        cenario.style.background = 'linear-gradient(180deg, #0284C7 0%, #38BDF8 100%)';
        cenario.innerHTML = '<div class="sol-vivo"></div>';
    } else if (codigo <= 3) {
        // Sol com Nuvens
        cenario.style.background = 'linear-gradient(180deg, #0369A1 0%, #7DD3FC 100%)';
        cenario.innerHTML = '<div class="sol-vivo"></div>';
        gerarNuvens(4, 'nuvem-branca');
    } else {
        // Nublado
        cenario.style.background = 'linear-gradient(180deg, #334155 0%, #94A3B8 100%)';
        gerarNuvens(7, 'nuvem-cinza');
    }
}

function gerarNuvens(qtd, classeCor) {
    const cenario = document.getElementById('cenario-clima');
    for (let i = 0; i < qtd; i++) {
        const nuvem = document.createElement('div');
        nuvem.className = `nuvem ${classeCor}`;
        nuvem.style.width = `${160 + Math.random() * 200}px`;
        nuvem.style.height = `${80 + Math.random() * 100}px`;
        nuvem.style.top = `${5 + Math.random() * 35}%`;
        nuvem.style.animationDuration = `${16 + Math.random() * 18}s`;
        nuvem.style.animationDelay = `-${Math.random() * 18}s`;
        cenario.appendChild(nuvem);
    }
}

function traduzirClimaComPeriodo(codigo, isDay) {
    if (isDay === 0) {
        if (codigo === 0) return { texto: "Noite Limpa e Estrelada", icone: "🌙" };
        if (codigo <= 3) return { texto: "Noite com Poucas Nuvens", icone: "☁️" };
        if (codigo >= 51 && codigo <= 67) return { texto: "Chuva Passageira Noturna", icone: "🌧️" };
        if (codigo >= 80 && codigo <= 82) return { texto: "Pancadas de Chuva", icone: "🌦️" };
        if (codigo >= 95) return { texto: "Chuva com Trovoadas", icone: "⛈️" };
        return { texto: "Noite Tropical com Nuvens", icone: "☁️" };
    }

    if (codigo === 0) return { texto: "Dia Ensolarado", icone: "☀️" };
    if (codigo <= 3) return { texto: "Sol com Nuvens", icone: "⛅" };
    if (codigo >= 51 && codigo <= 67) return { texto: "Chuva Passageira", icone: "🌧️" };
    if (codigo >= 80 && codigo <= 82) return { texto: "Pancadas de Chuva", icone: "🌦️" };
    if (codigo >= 95) return { texto: "Chuva com Trovoadas", icone: "⛈️" };
    return { texto: "Tempo Nublado", icone: "☁️" };
}

// 7. ACERVO EDITORIAL: BELEZA, CABELOS, VISAGISMO & ESTILO
const acervoBelezaEstilo = [
    {
        tag: "COLORAÇÃO & TENDÊNCIA",
        titulo: "Saiba quais tendências de coloração vão dominar os cabelos na primavera",
        resumo: "De acordo com o embaixador master Du Nunes, interpretações contemporâneas renovam e iluminam os fios com profundidade e acabamento natural.",
        origem: "Keune + CNN Brasil",
        imagem: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "TERAPIA CAPILAR",
        titulo: "Ozonioterapia capilar e hidratação profunda restauram a saúde dos fios danificados",
        resumo: "Protocolos com vapor de ozônio ativam a circulação no couro cabeludo e garantem nutrição intensa desde a primeira sessão.",
        origem: "Vogue Beleza",
        imagem: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "BARBA & GROOMING",
        titulo: "Barba Terapia: a combinação de toalhas quentes e óleos essenciais para o homem moderno",
        resumo: "Mais do que alinhamento dos fios, o tratamento previne foliculite e transforma o momento do barbear em uma experiência relaxante.",
        origem: "GQ Brasil",
        imagem: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "WELLNESS & BODYTECH",
        titulo: "Blindagem capilar pré e pós-treino: como proteger os fios do suor diário na academia",
        resumo: "Especialistas indicam o uso de finalizadores com barreira lipídica antes das atividades físicas para preservar o brilho e maciez.",
        origem: "Forbes Life",
        imagem: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "VISAGISMO EXECUTIVO",
        titulo: "O corte sob medida como instrumento de autoridade e imagem profissional",
        resumo: "O estudo das proporções faciais permite definir linhas de corte que valorizam os traços e transmitem sofisticação imediata.",
        origem: "Estilo & Imagem",
        imagem: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "LOIROS PERFEITOS",
        titulo: "Infinite Blonde: a tecnologia que clareia até 8 tons preservando a integridade capilar",
        resumo: "Com ativos protetores de ponta, o clareamento uniforme alcança tons platinados e dourados sem quebra da fibra.",
        origem: "Keune Haircosmetics",
        imagem: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80"
    }
];

let indexInfo = 0;

function trocarNoticiaVisual() {
    const p = acervoBelezaEstilo[indexInfo];
    const fotoEl = document.getElementById('noticia-foto');
    
    const preloader = new Image();
    preloader.src = p.imagem;
    preloader.onload = () => { fotoEl.src = p.imagem; };
    preloader.onerror = () => { fotoEl.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'; };

    document.getElementById('noticia-tag').innerText = p.tag;
    document.getElementById('noticia-titulo').innerText = p.titulo;
    document.getElementById('noticia-resumo').innerText = p.resumo;
    document.getElementById('noticia-origem-label').innerText = p.origem;

    indexInfo = (indexInfo + 1) % acervoBelezaEstilo.length;
}

// 8. ACERVO EDITORIAL: CIRCUITO BELÉM (TOURS, CULTURA & GASTRONOMIA)
const acervoToursBelem = [
    {
        tag: "SUNSET & GASTRONOMIA",
        local: "Estação das Docas • Baía do Guajará",
        titulo: "O pôr do sol mais icônico de Belém com alta gastronomia amazônica e cervejarias artesanais",
        desc: "Galpões portuários de 1870 restaurados oferecem vista panorâmica para o rio, feiras de artesanato nobre e o melhor do peixe regional com técnicas modernas.",
        curadoria: "VisioFlow City Guide",
        imagem: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "CULTURA & ARQUITETURA",
        local: "Praça da República • Centro Histórico",
        titulo: "Theatro da Paz: A imponência da Belle Époque amazônica em concertos e visitas guiadas",
        desc: "Uma das joias neoclássicas do Brasil, inaugurado em 1878 no apogeu da borracha, conta com lustres de cristal francês e acústica incomparável.",
        curadoria: "Circuito das Artes",
        imagem: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "ECOTURISMO & SABORES",
        local: "Ilha do Combu • Travessia Náutica",
        titulo: "Passeios fluviais e alta culinária ribeirinha: a rota do cacau selvagem a minutos de Belém",
        desc: "A poucos metros da capital, restaurantes rústicos sobre as águas e produções artesanais de chocolate orgânico proporcionam imersão sensorial única.",
        curadoria: "Experiências Náuticas",
        imagem: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "NATUREZA & PATRIMÔNIO",
        local: "Cidade Velha • Margens do Guamá",
        titulo: "Mangal das Garças: Oásis ecológico com vista de 360° no topo do Farol de Belém",
        desc: "Parque botânico com borboletário, aves livres e arquitetura paisagística premiada às margens do rio, ideal para uma pausa tranquila ao entardecer.",
        curadoria: "Parques & Paisagens",
        imagem: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "DESIGN & JOALHERIA",
        local: "São José Liberto • Cidade Velha",
        titulo: "Polo Joalheiro: Gemas da Amazônia, ouro e design autoral em convento do século XVIII",
        desc: "Espaço cultural preservado reúne mestres artesãos que transformam sementes nobres, minerais paraenses e ouro em joias de prestígio internacional.",
        curadoria: "Luxo & Tradição",
        imagem: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"
    }
];

let indexTour = 0;

function trocarAgendaVisual() {
    const tour = acervoToursBelem[indexTour];
    const fotoEl = document.getElementById('agenda-foto');

    const preloader = new Image();
    preloader.src = tour.imagem;
    preloader.onload = () => { fotoEl.src = tour.imagem; };
    preloader.onerror = () => { fotoEl.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'; };

    document.getElementById('agenda-tag').innerText = tour.tag;
    document.getElementById('agenda-local').innerText = `📍 ${tour.local}`;
    document.getElementById('agenda-titulo').innerText = tour.titulo;
    document.getElementById('agenda-desc').innerText = tour.desc;
    document.getElementById('agenda-curadoria').innerText = tour.curadoria;

    indexTour = (indexTour + 1) % acervoToursBelem.length;
}

// 9. CÂMBIO EM TEMPO REAL (AWESOMEAPI)
async function carregarCambio() {
    try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const moedas = await res.json();
        const dValor = parseFloat(moedas.USDBRL.bid).toFixed(2);
        const dVar = parseFloat(moedas.USDBRL.pctChange).toFixed(2);
        const eValor = parseFloat(moedas.EURBRL.bid).toFixed(2);
        const eVar = parseFloat(moedas.EURBRL.pctChange).toFixed(2);

        const aplicar = (idVal, idPct, valor, variacao) => {
            const elV = document.getElementById(idVal);
            const elP = document.getElementById(idPct);
            if (elV && elP) {
                elV.innerText = `R$ ${valor}`;
                elP.innerText = `${variacao >= 0 ? '▲ +' : '▼ '}${variacao}%`;
                elP.className = variacao >= 0 ? 'item-alta' : 'item-baixa';
            }
        };

        aplicar('val-dolar', 'pct-dolar', dValor, dVar);
        aplicar('val-dolar-clone', 'pct-dolar-clone', dValor, dVar);
        aplicar('val-euro', 'pct-euro', eValor, eVar);
        aplicar('val-euro-clone', 'pct-euro-clone', eValor, eVar);
    } catch (err) {
        console.error("Falha no câmbio:", err);
    }
}

// ==========================================================================
// 10. MÁQUINA DE TRANSMISSÃO EM 8 FASES (CICLO COMPLETO)
// ==========================================================================
const telaVideo = document.getElementById('fase-video');
const telaClima = document.getElementById('fase-clima');
const telaNoticias = document.getElementById('fase-noticias');
const telaAnuncio = document.getElementById('fase-anuncio');
const telaAgenda = document.getElementById('fase-agenda');
const telaAnuncieAqui = document.getElementById('fase-anuncie-aqui');
const telaProduto = document.getElementById('fase-produto');
const telaRelogio = document.getElementById('fase-relogio-mundial');

const videoSalao = document.getElementById('player-video');
const videoAnuncio = document.getElementById('player-anuncio');
const videoProduto = document.getElementById('player-produto');

const todasAsTelas = [telaVideo, telaClima, telaNoticias, telaAnuncio, telaAgenda, telaAnuncieAqui, telaProduto, telaRelogio];

function ativarApenas(telaAlvo) {
    todasAsTelas.forEach(t => {
        if (t) t.classList.remove('ativa');
    });
    if (telaAlvo) telaAlvo.classList.add('ativa');
}

// 1 ➔ 2
function irParaClima() {
    ativarApenas(telaClima);
    carregarPrevisaoBelem();
    setTimeout(irParaNoticias, 12000);
}

// 2 ➔ 3
function irParaNoticias() {
    ativarApenas(telaNoticias);
    trocarNoticiaVisual();
    setTimeout(irParaAnuncio, 12000);
}

// 3 ➔ 4
function irParaAnuncio() {
    ativarApenas(telaAnuncio);
    registrarAuditoria('anuncio');
    if (videoAnuncio) {
        videoAnuncio.currentTime = 0;
        videoAnuncio.play().catch(() => setTimeout(irParaAgenda, 10000));
    } else {
        setTimeout(irParaAgenda, 10000);
    }
}

// 4 ➔ 5 (Circuito Belém: Tours & Eventos 100% Vertical)
function irParaAgenda() {
    ativarApenas(telaAgenda);
    trocarAgendaVisual();
    setTimeout(irParaAnuncieAqui, 12000);
}

// 5 ➔ 6 (Anuncie na VisionFlow)
function irParaAnuncieAqui() {
    ativarApenas(telaAnuncieAqui);
    setTimeout(irParaProduto, 11000);
}

// 6 ➔ 7 (Vídeo do Produto L'Oréal)
function irParaProduto() {
    ativarApenas(telaProduto);
    registrarAuditoria('produto_salao');
    if (videoProduto) {
        videoProduto.currentTime = 0;
        videoProduto.play().catch(() => setTimeout(irParaRelogioMundial, 10000));
    } else {
        setTimeout(irParaRelogioMundial, 10000);
    }
}

// 7 ➔ 8 (World Clock - Última Fase)
function irParaRelogioMundial() {
    ativarApenas(telaRelogio);
    atualizarRelogiosMundiais();
    setTimeout(voltarParaVideoPrincipal, 12000);
}

// 8 ➔ 1 (Reinicia o ciclo completo)
function voltarParaVideoPrincipal() {
    ativarApenas(telaVideo);
    registrarAuditoria('ciclo_fechado');
    registrarAuditoria('salao');

    if (videoSalao) {
        videoSalao.currentTime = 0;
        videoSalao.play().catch(() => console.log("Aguardando foco para autoplay."));
    }
}

// Listeners de Término de Vídeo
if (videoSalao) videoSalao.onended = irParaClima;
if (videoAnuncio) videoAnuncio.onended = irParaAgenda;
if (videoProduto) videoProduto.onended = irParaRelogioMundial;

// Fallbacks de proteção
if (videoSalao) videoSalao.onerror = () => setTimeout(irParaClima, 10000);
if (videoAnuncio) videoAnuncio.onerror = () => setTimeout(irParaAgenda, 10000);
if (videoProduto) videoProduto.onerror = () => setTimeout(voltarParaVideoPrincipal, 10000);

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    ativarWakeLock();
    atualizarRelogiosMundiais();
    registrarAuditoria('salao');
    trocarNoticiaVisual();
    trocarAgendaVisual();
    carregarPrevisaoBelem();
    carregarCambio();

    if (videoSalao) {
        videoSalao.play().catch(() => console.log("Aguardando interação inicial."));
    }
    setInterval(carregarCambio, 120000);
});
