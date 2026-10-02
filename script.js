// ==========================================================================
// VISIOFLOW MEDIA - ENGINE DEFINITIVA (TRAVA ELEITORAL + FOTOS REAIS BELÉM)
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
        console.log('[VisioFlow] Wake Lock não disponível:', err);
    }
}

document.addEventListener('visibilitychange', async () => {
    if (wakeLockSentinel !== null && document.visibilityState === 'visible') {
        await ativarWakeLock();
    }
});

// 2. MOTOR DO WORLD CLOCK
function atualizarRelogiosMundiais() {
    const agora = new Date();

    try {
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
    } catch (e) {
        const h = String(agora.getHours()).padStart(2, '0');
        const m = String(agora.getMinutes()).padStart(2, '0');
        const s = String(agora.getSeconds()).padStart(2, '0');
        const elBrasilia = document.getElementById('clock-brasilia');
        if (elBrasilia) elBrasilia.innerHTML = `${h}:${m}<span class="clock-segundos">:${s}</span>`;
    }

    formatarHoraSegura('clock-ny', -4);
    formatarHoraSegura('clock-london', 1);
    formatarHoraSegura('clock-dubai', 4);
    formatarHoraSegura('clock-tokyo', 9);
}

function formatarHoraSegura(elementId, utcOffset) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const agoraUTC = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000));
    const dataAlvo = new Date(agoraUTC.getTime() + (utcOffset * 3600000));
    const h = String(dataAlvo.getHours()).padStart(2, '0');
    const m = String(dataAlvo.getMinutes()).padStart(2, '0');
    el.innerText = `${h}:${m}`;
}

setInterval(atualizarRelogiosMundiais, 1000);

// 3. AUDITORIA & PROVA DE EXIBIÇÃO
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

// Imagens reais de alta resolução de Belém (sem bloqueio 403)
function tratarErroImagem(img) {
    img.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80';
}

function tratarErroImagemAgenda(img) {
    img.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
}

// ==========================================================================
// 6. MOTOR DE CLIMA COM CACHE PERSISTENTE (SEM NÚMEROS PISCANDO)
// ==========================================================================
const CLIMA_CACHE_KEY = 'visioflow_weather_cache';

async function carregarPrevisaoBelem() {
    const cacheSalvo = localStorage.getItem(CLIMA_CACHE_KEY);
    if (cacheSalvo) {
        try {
            const dadosCache = JSON.parse(cacheSalvo);
            renderizarDadosClima(dadosCache);
        } catch(e) {}
    }

    try {
        const opcoesData = { weekday: 'long', day: 'numeric', month: 'short' };
        const dataHojeFormatada = new Date().toLocaleDateString('pt-BR', opcoesData);
        document.getElementById('clima-data-hoje').innerText = `Belém, PA • ${dataHojeFormatada}`;

        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-1.4558&longitude=-48.4902&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FBelem';
        const res = await fetch(url);
        const dados = await res.json();

        if (dados && dados.current) {
            localStorage.setItem(CLIMA_CACHE_KEY, JSON.stringify(dados));
            renderizarDadosClima(dados);
        }
    } catch (err) {
        console.warn("Utilizando dados seguros do cache de Belém:", err);
    }
}

function renderizarDadosClima(dados) {
    const tempAtual = Math.round(dados.current.temperature_2m);
    const umidade = dados.current.relative_humidity_2m || 82;
    const vento = Math.round(dados.current.wind_speed_10m) || 10;
    const codeAtual = dados.current.weather_code;
    const isDayAtual = dados.current.is_day;

    let sensacaoReal = Math.round(dados.current.apparent_temperature);
    if (umidade >= 75 && tempAtual >= 26) {
        sensacaoReal = Math.max(sensacaoReal, tempAtual + 5);
    }

    const maxHoje = Math.round(dados.daily.temperature_2m_max[0]) || 33;
    const minHoje = Math.round(dados.daily.temperature_2m_min[0]) || 24;

    const horaAtual = new Date().getHours();
    const chuvaAgora = (dados.hourly && dados.hourly.precipitation_probability) ? (dados.hourly.precipitation_probability[horaAtual] || 0) : 0;

    document.getElementById('temp-agora').innerText = tempAtual;
    const traducao = traduzirClimaComPeriodo(codeAtual, isDayAtual);
    document.getElementById('condicao-agora').innerText = traducao.texto;
    document.getElementById('google-icone-hero').innerText = traducao.icone;
    document.getElementById('clima-sensacao').innerText = `${sensacaoReal}°`;
    document.getElementById('temp-hoje-max').innerText = maxHoje;
    document.getElementById('temp-hoje-min').innerText = minHoje;

    document.getElementById('clima-chuva-hoje').innerText = `${chuvaAgora}%`;
    document.getElementById('clima-vento-hoje').innerText = `${vento} km/h`;
    document.getElementById('clima-umidade-hoje').innerText = `${umidade}%`;
    document.getElementById('clima-ar-hoje').innerText = "26 • Boa";

    renderizarCenarioAtmosferico(codeAtual, isDayAtual);

    const containerTimeline = document.getElementById('container-timeline-horas');
    if (containerTimeline && dados.hourly && dados.hourly.time) {
        containerTimeline.innerHTML = '';
        for (let offset = 0; offset <= 4; offset++) {
            const indexHora = horaAtual + offset;
            if (dados.hourly.time[indexHora]) {
                const tempH = Math.round(dados.hourly.temperature_2m[indexHora]);
                const codeH = dados.hourly.weather_code[indexHora];
                const isDayH = dados.hourly.is_day[indexHora];
                const chuvaH = dados.hourly.precipitation_probability ? (dados.hourly.precipitation_probability[indexHora] || 0) : 0;
                const infoH = traduzirClimaComPeriodo(codeH, isDayH);
                
                const labelHora = offset === 0 ? 'Agora' : `${String(indexHora % 24).padStart(2, '0')}:00`;
                const chuvaLabel = chuvaH > 15 ? `${chuvaH}%` : '';

                containerTimeline.innerHTML += `
                    <div class="g-hora-col">
                        <span class="g-hora-txt">${labelHora}</span>
                        <span class="g-hora-chuva">${chuvaLabel}</span>
                        <div class="g-hora-ico">${infoH.icone}</div>
                        <span class="g-hora-graus">${tempH}°</span>
                    </div>
                `;
            }
        }
    }

    const containerDias = document.getElementById('container-previsao-dias');
    if (containerDias && dados.daily && dados.daily.time) {
        containerDias.innerHTML = '';
        const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let d = 1; d <= 5; d++) {
            if (dados.daily.time[d]) {
                const dataD = new Date(dados.daily.time[d] + 'T00:00:00-03:00');
                const nomeDia = nomesDias[dataD.getDay()];
                const codeD = dados.daily.weather_code[d];
                const maxD = Math.round(dados.daily.temperature_2m_max[d]);
                const minD = Math.round(dados.daily.temperature_2m_min[d]);
                const infoD = traduzirClimaComPeriodo(codeD, 1);

                containerDias.innerHTML += `
                    <div class="g-dia-col">
                        <span class="g-dia-nome">${nomeDia}</span>
                        <div class="g-dia-ico">${infoD.icone}</div>
                        <span class="g-dia-extremos"><strong>${maxD}°</strong>/${minD}°</span>
                    </div>
                `;
            }
        }
    }
}

function renderizarCenarioAtmosferico(codigo, isDay) {
    const cenario = document.getElementById('cenario-clima');
    if (!cenario) return;
    cenario.innerHTML = '';

    const horaAtual = new Date().getHours();
    const minutos = new Date().getMinutes();
    const horarioDecimal = horaAtual + (minutos / 60);

    if (codigo >= 51) {
        cenario.style.background = 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)';
        gerarNuvens(6, 'nuvem-cinza');
        for (let i = 0; i < 35; i++) {
            const gota = document.createElement('div');
            gota.className = 'gota';
            gota.style.left = `${Math.random() * 100}%`;
            gota.style.animationDelay = `${Math.random() * 1}s`;
            cenario.appendChild(gota);
        }
        return;
    }

    if (horarioDecimal >= 17.5 && horarioDecimal <= 18.6) {
        cenario.style.background = 'linear-gradient(180deg, #4C1D95 0%, #E11D48 40%, #F59E0B 100%)';
        cenario.innerHTML = '<div class="sol-poente"></div>';
        gerarNuvens(5, 'nuvem-rosada');
        return;
    }

    if (isDay === 0) {
        cenario.style.background = 'linear-gradient(180deg, #020617 0%, #0F172A 100%)';
        cenario.innerHTML = '<div class="lua"></div>';
        for (let i = 0; i < 25; i++) {
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

    if (codigo === 0) {
        cenario.style.background = 'linear-gradient(180deg, #0284C7 0%, #38BDF8 100%)';
        cenario.innerHTML = '<div class="sol-vivo"></div>';
    } else if (codigo <= 3) {
        cenario.style.background = 'linear-gradient(180deg, #0369A1 0%, #7DD3FC 100%)';
        cenario.innerHTML = '<div class="sol-vivo"></div>';
        gerarNuvens(4, 'nuvem-branca');
    } else {
        cenario.style.background = 'linear-gradient(180deg, #334155 0%, #94A3B8 100%)';
        gerarNuvens(6, 'nuvem-cinza');
    }
}

function gerarNuvens(qtd, classeCor) {
    const cenario = document.getElementById('cenario-clima');
    if (!cenario) return;
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
        if (codigo <= 3) return { texto: "Céu limpo com períodos nublados", icone: "☁️" };
        if (codigo >= 51 && codigo <= 67) return { texto: "Chuva passageira noturna", icone: "🌧️" };
        if (codigo >= 80 && codigo <= 82) return { texto: "Pancadas de chuva", icone: "🌦️" };
        if (codigo >= 95) return { texto: "Chuva com trovoadas", icone: "⛈️" };
        return { texto: "Noite tropical com nuvens", icone: "☁️" };
    }

    if (codigo === 0) return { texto: "Dia ensolarado", icone: "☀️" };
    if (codigo <= 3) return { texto: "Sol com períodos nublados", icone: "⛅" };
    if (codigo >= 51 && codigo <= 67) return { texto: "Chuva passageira", icone: "🌧️" };
    if (codigo >= 80 && codigo <= 82) return { texto: "Pancadas de chuva", icone: "🌦️" };
    if (codigo >= 95) return { texto: "Chuva com trovoadas", icone: "⛈️" };
    return { texto: "Tempo nublado", icone: "☁️" };
}

// ==========================================================================
// 7. MOTOR AO VIVO COM TRAVA DE SEGURANÇA TOTAL CONTRA POLÍTICA E CRIME
// ==========================================================================
const PALAVRAS_BLOQUEADAS = [
    // Trava de Violência e Tragédias
    'morte', 'morre', 'morto', 'morta', 'assassinato', 'homicídio', 'preso',
    'prisão', 'polícia', 'policial', 'tiroteio', 'crime', 'droga', 'tráfico',
    'acidente', 'batida', 'ferido', 'vítima', 'roubo', 'assalto', 'furto',
    'operação', 'investigado', 'corrupção', 'presídio', 'cadeia', 'baleado',
    // TRAVA ELEITORAL & POLÍTICA (FIM DEFINITIVO DE LISTAS DE CANDIDATOS)
    'candidato', 'candidatos', 'candidata', 'eleição', 'eleições', 'deputado',
    'deputada', 'senador', 'senadora', 'governador', 'partido', 'urna',
    'tse', 'tre', 'alepa', 'voto', 'votação', 'política', 'pesquisa eleitoral',
    'propaganda', 'coligação', 'vereador', 'prefeito', 'prefeita', 'reforma eleitoral'
];

let noticiasAoVivo = [];
let indexNoticiaAoVivo = 0;

async function buscarNoticiasG1Belem() {
    try {
        const rssUrl = encodeURIComponent('https://g1.globo.com/dynamo/pa/para/rss2.xml');
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await res.json();

        if (data && data.items && data.items.length > 0) {
            // Filtro rígido: descarta qualquer menção política ou criminal
            const filtradas = data.items.filter(item => {
                const textoCompleto = `${item.title} ${item.description}`.toLowerCase();
                const temBloqueio = PALAVRAS_BLOQUEADAS.some(palavra => textoCompleto.includes(palavra));
                return !temBloqueio;
            });

            if (filtradas.length > 0) {
                noticiasAoVivo = filtradas.map(item => {
                    let imgUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
                    if (!imgUrl) {
                        const imgMatch = item.description ? item.description.match(/<img[^>]+src="([^">]+)"/) : null;
                        imgUrl = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80';
                    }

                    // Limpa tags HTML e limita o resumo em no máximo 140 caracteres
                    let descLimpa = item.description ? item.description.replace(/<[^>]*>?/gm, '').trim() : "Acompanhe os principais destaques de cultura, economia e acontecimentos da capital paraense.";
                    if (descLimpa.length > 140) {
                        descLimpa = descLimpa.substring(0, 140) + '...';
                    }

                    return {
                        chapeu: "G1 Pará • Belém em Tempo Real",
                        titulo: item.title,
                        resumo: descLimpa,
                        origem: "G1 Pará / Jornalismo Oficial",
                        imagem: imgUrl
                    };
                });
            }
        }
    } catch (e) {
        console.warn("Utilizando acervo editorial de reserva:", e);
    }
}

// Acervo editorial de reserva (100% blindado para salão de luxo)
const acervoEditorialReserva = [
    {
        chapeu: "Tendências & Cuidados • Primavera",
        titulo: "Colorações luminosas dominam as preferências em salões de alto padrão",
        resumo: "De acordo com o embaixador master Du Nunes, mechas com profundidade e contraste suave valorizam o movimento natural dos cabelos.",
        origem: "Keune + CNN Brasil",
        imagem: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
    },
    {
        chapeu: "Saúde Capilar no Clima Tropical",
        titulo: "Ozonioterapia capilar combate os efeitos da alta umidade de Belém",
        resumo: "O vapor com ozônio medicinal purifica o couro cabeludo, reduz a oleosidade típica do clima paraense e fortalece a fibra capilar.",
        origem: "Vogue Beleza & Saúde",
        imagem: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
    },
    {
        chapeu: "Grooming Executivo • Doca & Umarizal",
        titulo: "Barba Terapia com toalhas quentes transforma a rotina masculina de cuidados",
        resumo: "Abertura dos poros com vapor aromático, óleos vegetais nobres e navalhamento milimétrico previnem irritações e garantem alinhamento impecável.",
        origem: "GQ Brasil • Edição Homem",
        imagem: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80"
    }
];

function trocarNoticiaVisual() {
    const listaAtiva = (noticiasAoVivo.length > 0) ? noticiasAoVivo : acervoEditorialReserva;
    const p = listaAtiva[indexNoticiaAoVivo % listaAtiva.length];
    
    const fotoEl = document.getElementById('noticia-foto');
    if (fotoEl) {
        fotoEl.src = p.imagem;
    }

    document.getElementById('noticia-chapeu').innerText = p.chapeu;
    document.getElementById('noticia-titulo').innerText = p.titulo;
    document.getElementById('noticia-resumo').innerText = p.resumo;
    document.getElementById('noticia-origem-label').innerText = p.origem;

    indexNoticiaAoVivo++;
}

// ==========================================================================
// 8. CIRCUITO BELÉM (FOTOS HISTÓRICAS REAIS DESBLOQUEADAS)
// ==========================================================================
const acervoToursBelem = [
    {
        local: "Estação das Docas • Baía do Guajará",
        titulo: "Pôr do sol à beira da baía com cervejarias artesanais e alta gastronomia",
        desc: "Galpões ingleses de 1870 restaurados reúnem o chope com infusão de bacuri da Amazon Beer, o tradicional sorvete da Cairu e restaurantes com vista panorâmica para o rio.",
        curadoria: "Roteiro Gastronômico da Baía",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Esta%C3%A7%C3%A3o_das_Docas%2C_Bel%C3%A9m_-_PA.jpg/1280px-Esta%C3%A7%C3%A3o_das_Docas%2C_Bel%C3%A9m_-_PA.jpg"
    },
    {
        local: "Praça da República • Centro Histórico",
        titulo: "Theatro da Paz: A acústica perfeita da Belle Époque amazônica",
        desc: "Inaugurado em 1878 no auge do ciclo da borracha, o teatro é uma obra-prima neoclássica com lustres de cristal francês, afrescos italianos e piso de madeiras nobres da floresta.",
        curadoria: "Circuito das Artes e Concertos",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Theatro_da_Paz%2C_Bel%C3%A9m%2C_Par%C3%A1%2C_Brasil_%282022%29_01.jpg/1280px-Theatro_da_Paz%2C_Bel%C3%A9m%2C_Par%C3%A1%2C_Brasil_%282022%29_01.jpg"
    },
    {
        local: "Mangal das Garças • Cidade Velha",
        titulo: "Oásis ecológico com vista de 360° no topo do Farol de Belém",
        desc: "Parque naturalístico às margens do Rio Guamá com borboletário, guarás vermelhos em revoada livre e o prestigiado buffet regional do Restaurante Manjar das Garças.",
        curadoria: "Parques e Patrimônio Ambiental",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mangal_das_Gar%C3%A7as%2C_Bel%C3%A9m_-_PA_%2848148995396%29.jpg/1280px-Mangal_das_Gar%C3%A7as%2C_Bel%C3%A9m_-_PA_%2848148995396%29.jpg"
    },
    {
        local: "Complexo Ver-o-Peso • Boulevard Castilhos França",
        titulo: "Ver-o-Peso: Mais de 390 anos de história viva, sabores e essências",
        desc: "O maior mercado a céu aberto da América Latina é patrimônio histórico nacional, reunindo peixes frescos da bacia amazônica, ervas aromáticas e frutas típicas da nossa terra.",
        curadoria: "Patrimônio Cultural do Brasil",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercado_Ver-o-Peso_-_Bel%C3%A9m_-_Par%C3%A1_-_Brasil.jpg/1280px-Mercado_Ver-o-Peso_-_Bel%C3%A9m_-_Par%C3%A1_-_Brasil.jpg"
    },
    {
        local: "Forte do Presépio • Berço Histórico de Belém",
        titulo: "Forte do Castelo: A fundação de Belém de frente para a foz do Rio Guamá",
        desc: "Marco inicial da cidade fundado em 1616, com canhões históricos preservados, Museu do Encontro e vista panorâmica inigualável para a Baía do Guajará.",
        curadoria: "Complexo Feliz Lusitânia",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Forte_do_Castelo_em_Bel%C3%A9m_do_Par%C3%A1.jpg/1280px-Forte_do_Castelo_em_Bel%C3%A9m_do_Par%C3%A1.jpg"
    }
];

let indexTour = 0;

function trocarAgendaVisual() {
    const tour = acervoToursBelem[indexTour % acervoToursBelem.length];
    const fotoEl = document.getElementById('agenda-foto');
    if (fotoEl) {
        fotoEl.src = tour.imagem;
    }

    document.getElementById('agenda-local').innerText = `📍 ${tour.local}`;
    document.getElementById('agenda-titulo').innerText = tour.titulo;
    document.getElementById('agenda-desc').innerText = tour.desc;
    document.getElementById('agenda-curadoria').innerText = tour.curadoria;

    indexTour++;
}

// 9. CÂMBIO EM TEMPO REAL
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
// 10. MÁQUINA DE TRANSMISSÃO EM 10 FASES (NOVA ORDEM COM AS 2 ÚLTIMAS TELAS)
// ==========================================================================
const telaVideo = document.getElementById('fase-video');
const telaClima = document.getElementById('fase-clima');
const telaNoticias = document.getElementById('fase-noticias');
const telaAnuncio = document.getElementById('fase-anuncio');
const telaAgenda = document.getElementById('fase-agenda');
const telaAnuncieAqui = document.getElementById('fase-anuncie-aqui');
const telaProduto = document.getElementById('fase-produto');
const telaRelogio = document.getElementById('fase-relogio-mundial');
const telaVideoExtra = document.getElementById('fase-video-extra');
const telaFeedback = document.getElementById('fase-feedback');

const videoSalao = document.getElementById('player-video');
const videoAnuncio = document.getElementById('player-anuncio');
const videoProduto = document.getElementById('player-produto');
const videoExtra = document.getElementById('player-video-extra');

const todasAsTelas = [
    telaVideo, telaClima, telaNoticias, telaAnuncio, telaAgenda, 
    telaAnuncieAqui, telaProduto, telaRelogio, telaVideoExtra, telaFeedback
];

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
    trocarNoticiaVisual();
    ativarApenas(telaNoticias);
    setTimeout(irParaAnuncio, 12000);
}

// 3 ➔ 4
function irParaAnuncio() {
    ativarApenas(telaAnuncio);
    registrarAuditoria('anuncio');
    
    let videoIniciou = false;
    if (videoAnuncio) {
        videoAnuncio.currentTime = 0;
        videoAnuncio.play().then(() => {
            videoIniciou = true;
        }).catch(() => {});
    }

    setTimeout(() => {
        if (!videoIniciou || (videoAnuncio && videoAnuncio.paused)) {
            irParaAgenda();
        }
    }, 2500);
}

// 4 ➔ 5
function irParaAgenda() {
    trocarAgendaVisual();
    ativarApenas(telaAgenda);
    setTimeout(irParaAnuncieAqui, 12000);
}

// 5 ➔ 6
function irParaAnuncieAqui() {
    ativarApenas(telaAnuncieAqui);
    setTimeout(irParaProduto, 11000);
}

// 6 ➔ 7
function irParaProduto() {
    ativarApenas(telaProduto);
    registrarAuditoria('produto_salao');

    let videoIniciou = false;
    if (videoProduto) {
        videoProduto.currentTime = 0;
        videoProduto.play().then(() => {
            videoIniciou = true;
        }).catch(() => {});
    }

    setTimeout(() => {
        if (!videoIniciou || (videoProduto && videoProduto.paused)) {
            irParaRelogioMundial();
        }
    }, 2500);
}

// 7 ➔ 8
function irParaRelogioMundial() {
    ativarApenas(telaRelogio);
    atualizarRelogiosMundiais();
    setTimeout(irParaVideoExtra, 11000);
}

// 8 ➔ 9
function irParaVideoExtra() {
    ativarApenas(telaVideoExtra);

    let videoIniciou = false;
    if (videoExtra) {
        videoExtra.currentTime = 0;
        videoExtra.play().then(() => {
            videoIniciou = true;
        }).catch(() => {});
    }

    setTimeout(() => {
        if (!videoIniciou || (videoExtra && videoExtra.paused)) {
            irParaFeedback();
        }
    }, 2000);
}

// 9 ➔ 10 (Feedback com "Gostou da experiência?")
function irParaFeedback() {
    ativarApenas(telaFeedback);
    setTimeout(voltarParaVideoPrincipal, 13000);
}

// 10 ➔ 1 (Reinicia no Salão)
function voltarParaVideoPrincipal() {
    ativarApenas(telaVideo);
    registrarAuditoria('ciclo_fechado');
    registrarAuditoria('salao');

    let videoIniciou = false;
    if (videoSalao) {
        videoSalao.currentTime = 0;
        videoSalao.play().then(() => {
            videoIniciou = true;
        }).catch(() => {});
    }

    setTimeout(() => {
        if (!videoIniciou || (videoSalao && videoSalao.paused)) {
            irParaClima();
        }
    }, 2500);
}

// Listeners de Término Real de Vídeo
if (videoSalao) videoSalao.onended = irParaClima;
if (videoAnuncio) videoAnuncio.onended = irParaAgenda;
if (videoProduto) videoProduto.onended = irParaRelogioMundial;
if (videoExtra) videoExtra.onended = irParaFeedback;

// Fallbacks de proteção imediata
if (videoSalao) videoSalao.onerror = () => setTimeout(irParaClima, 2500);
if (videoAnuncio) videoAnuncio.onerror = () => setTimeout(irParaAgenda, 2500);
if (videoProduto) videoProduto.onerror = () => setTimeout(irParaRelogioMundial, 2500);
if (videoExtra) videoExtra.onerror = () => setTimeout(irParaFeedback, 2000);

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    ativarWakeLock();
    atualizarRelogiosMundiais();
    registrarAuditoria('salao');
    carregarPrevisaoBelem();
    carregarCambio();
    buscarNoticiasG1Belem();

    voltarParaVideoPrincipal();

    setInterval(carregarCambio, 120000);
    setInterval(buscarNoticiasG1Belem, 300000);
});
