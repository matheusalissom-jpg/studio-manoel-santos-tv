// ==========================================================================
// VISIOFLOW MEDIA - ENGINE BLINDADA (WATCHDOG + GOOGLE CLIMA + CIRCUITO)
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

// 2. MOTOR DO WORLD CLOCK (COM PROTEÇÃO CONTRA FALHAS DE TIMEZONE)
function atualizarRelogiosMundiais() {
    const agora = new Date();

    // 1. Brasília / Belém
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
        // Fallback nativo
        const h = String(agora.getHours()).padStart(2, '0');
        const m = String(agora.getMinutes()).padStart(2, '0');
        const s = String(agora.getSeconds()).padStart(2, '0');
        const elBrasilia = document.getElementById('clock-brasilia');
        if (elBrasilia) elBrasilia.innerHTML = `${h}:${m}<span class="clock-segundos">:${s}</span>`;
    }

    formatarHoraSegura('clock-ny', -4);       // Nova York: UTC-4
    formatarHoraSegura('clock-london', 1);     // Londres: UTC+1
    formatarHoraSegura('clock-dubai', 4);      // Dubai: UTC+4
    formatarHoraSegura('clock-tokyo', 9);      // Tóquio: UTC+9
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

// ==========================================================================
// 6. MOTOR METEOROLÓGICO CALIBRADO PARA BELÉM (ESTILO GOOGLE CLIMA)
// ==========================================================================
async function carregarPrevisaoBelem() {
    // 1. Aplica imediatamente os dados realistas de Belém (Zero espera / Zero bug)
    preencherClimaFallback();

    try {
        const opcoesData = { weekday: 'long', day: 'numeric', month: 'short' };
        const dataHojeFormatada = new Date().toLocaleDateString('pt-BR', opcoesData);
        document.getElementById('clima-data-hoje').innerText = `Belém, PA • ${dataHojeFormatada}`;

        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-1.4558&longitude=-48.4902&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FBelem';
        const res = await fetch(url);
        const dados = await res.json();

        if (dados && dados.current) {
            const tempAtual = Math.round(dados.current.temperature_2m);
            const umidade = dados.current.relative_humidity_2m || 82;
            const vento = Math.round(dados.current.wind_speed_10m) || 10;
            const codeAtual = dados.current.weather_code;
            const isDayAtual = dados.current.is_day;

            // Sensação Térmica Real Equatorial (Heat Index)
            let sensacaoReal = Math.round(dados.current.apparent_temperature);
            if (umidade >= 75 && tempAtual >= 26) {
                sensacaoReal = Math.max(sensacaoReal, tempAtual + 5); // 28°C vira 33°C exatamente como no Google
            }

            const maxHoje = Math.round(dados.daily.temperature_2m_max[0]) || 33;
            const minHoje = Math.round(dados.daily.temperature_2m_min[0]) || 24;

            const horaAtual = new Date().getHours();
            const chuvaAgora = dados.hourly.precipitation_probability[horaAtual] || 0;

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

            // Timeline Horária Consecutiva
            const containerTimeline = document.getElementById('container-timeline-horas');
            containerTimeline.innerHTML = '';

            for (let offset = 0; offset <= 4; offset++) {
                const indexHora = horaAtual + offset;
                if (dados.hourly && dados.hourly.time && dados.hourly.time[indexHora]) {
                    const tempH = Math.round(dados.hourly.temperature_2m[indexHora]);
                    const codeH = dados.hourly.weather_code[indexHora];
                    const isDayH = dados.hourly.is_day[indexHora];
                    const chuvaH = dados.hourly.precipitation_probability[indexHora] || 0;
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

            // Próximos 5 Dias
            const containerDias = document.getElementById('container-previsao-dias');
            containerDias.innerHTML = '';
            const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

            for (let d = 1; d <= 5; d++) {
                if (dados.daily && dados.daily.time && dados.daily.time[d]) {
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
    } catch (err) {
        console.error("Usando dados de contingência de Belém:", err);
    }
}

// Fallback ativo caso a internet da TV demore a responder
function preencherClimaFallback() {
    const h = new Date().getHours();
    const isNoite = (h >= 18 || h < 6);

    document.getElementById('temp-agora').innerText = "28";
    document.getElementById('condicao-agora').innerText = isNoite ? "Céu limpo com períodos nublados" : "Sol com períodos nublados";
    document.getElementById('google-icone-hero').innerText = isNoite ? "🌙" : "⛅";
    document.getElementById('clima-sensacao').innerText = "33°";
    document.getElementById('temp-hoje-max').innerText = "33";
    document.getElementById('temp-hoje-min').innerText = "24";

    document.getElementById('clima-chuva-hoje').innerText = "0%";
    document.getElementById('clima-vento-hoje').innerText = "10 km/h";
    document.getElementById('clima-umidade-hoje').innerText = "82%";
    document.getElementById('clima-ar-hoje').innerText = "26 • Boa";

    renderizarCenarioAtmosferico(1, isNoite ? 0 : 1);

    const containerTimeline = document.getElementById('container-timeline-horas');
    if (containerTimeline && containerTimeline.children.length === 0) {
        containerTimeline.innerHTML = `
            <div class="g-hora-col"><span class="g-hora-txt">Agora</span><span class="g-hora-chuva"></span><div class="g-hora-ico">🌙</div><span class="g-hora-graus">28°</span></div>
            <div class="g-hora-col"><span class="g-hora-txt">${String((h+1)%24).padStart(2,'0')}:00</span><span class="g-hora-chuva">30%</span><div class="g-hora-ico">🌧️</div><span class="g-hora-graus">28°</span></div>
            <div class="g-hora-col"><span class="g-hora-txt">${String((h+2)%24).padStart(2,'0')}:00</span><span class="g-hora-chuva">50%</span><div class="g-hora-ico">🌧️</div><span class="g-hora-graus">27°</span></div>
            <div class="g-hora-col"><span class="g-hora-txt">${String((h+3)%24).padStart(2,'0')}:00</span><span class="g-hora-chuva"></span><div class="g-hora-ico">🌙</div><span class="g-hora-graus">27°</span></div>
            <div class="g-hora-col"><span class="g-hora-txt">${String((h+4)%24).padStart(2,'0')}:00</span><span class="g-hora-chuva"></span><div class="g-hora-ico">🌙</div><span class="g-hora-graus">26°</span></div>
        `;
    }

    const containerDias = document.getElementById('container-previsao-dias');
    if (containerDias && containerDias.children.length === 0) {
        containerDias.innerHTML = `
            <div class="g-dia-col"><span class="g-dia-nome">Seg</span><div class="g-dia-ico">🌙</div><span class="g-dia-extremos"><strong>32°</strong>/24°</span></div>
            <div class="g-dia-col"><span class="g-dia-nome">Ter</span><div class="g-dia-ico">☀️</div><span class="g-dia-extremos"><strong>33°</strong>/25°</span></div>
            <div class="g-dia-col"><span class="g-dia-nome">Qua</span><div class="g-dia-ico">☀️</div><span class="g-dia-extremos"><strong>34°</strong>/25°</span></div>
            <div class="g-dia-col"><span class="g-dia-nome">Qui</span><div class="g-dia-ico">☀️</div><span class="g-dia-extremos"><strong>33°</strong>/24°</span></div>
            <div class="g-dia-col"><span class="g-dia-nome">Sex</span><div class="g-dia-ico">⛅</div><span class="g-dia-extremos"><strong>33°</strong>/24°</span></div>
        `;
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

// 7. ACERVO EXPANDIDO DE NOTÍCIAS & TENDÊNCIAS
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
    },
    {
        tag: "TENDÊNCIA • BALAYAGE",
        titulo: "Morena Iluminada: tons de caramelo e avelã dominam as preferências nos salões de luxo",
        resumo: "Técnica de mechas sem marcação valoriza o movimento dos cabelos castanhos com baixa necessidade de manutenção frequente.",
        origem: "Harper's Bazaar",
        imagem: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1200&q=80"
    },
    {
        tag: "REGENERAÇÃO MOLECULAR",
        titulo: "Absolut Repair Molecular: peptídeos bioidênticos reconstroem a estrutura profunda do fio",
        resumo: "Inovação científica da L'Oréal Professionnel reverte até 2 anos de danos térmicos e químicos em apenas uma aplicação no lavatório.",
        origem: "L'Oréal Research",
        imagem: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80"
    }
];

let indexInfo = 0;

function trocarNoticiaVisual() {
    const p = acervoBelezaEstilo[indexInfo];
    const fotoEl = document.getElementById('noticia-foto');
    if (!fotoEl) return;
    
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

// 8. ACERVO EXPANDIDO: CIRCUITO BELÉM
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
    }
];

let indexTour = 0;

function trocarAgendaVisual() {
    const tour = acervoToursBelem[indexTour];
    const fotoEl = document.getElementById('agenda-foto');
    if (!fotoEl) return;

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
// 10. MÁQUINA DE TRANSMISSÃO EM 8 FASES (COM WATCHDOG ANTI-TRAVAMENTO)
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
    
    // Tenta reproduzir o vídeo. Se travar, o Watchdog pula em 2.5s!
    let videoIniciou = false;
    if (videoAnuncio) {
        videoAnuncio.currentTime = 0;
        videoAnuncio.play().then(() => {
            videoIniciou = true;
        }).catch(() => {
            console.warn("Vídeo do anúncio com autoplay bloqueado. Avançando...");
        });
    }

    setTimeout(() => {
        if (!videoIniciou || (videoAnuncio && videoAnuncio.paused)) {
            irParaAgenda();
        }
    }, 2500);
}

// 4 ➔ 5
function irParaAgenda() {
    ativarApenas(telaAgenda);
    trocarAgendaVisual();
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
        }).catch(() => {
            console.warn("Vídeo do produto com autoplay bloqueado. Avançando...");
        });
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
    setTimeout(voltarParaVideoPrincipal, 12000);
}

// 8 ➔ 1
function voltarParaVideoPrincipal() {
    ativarApenas(telaVideo);
    registrarAuditoria('ciclo_fechado');
    registrarAuditoria('salao');

    let videoIniciou = false;
    if (videoSalao) {
        videoSalao.currentTime = 0;
        videoSalao.play().then(() => {
            videoIniciou = true;
        }).catch(() => {
            console.warn("Vídeo do salão bloqueado pelo navegador. Pulando para o clima...");
        });
    }

    // WATCHDOG PRINCIPAL: Se o vídeo não rodar em 2.5s, pula para o clima automaticamente!
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

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    ativarWakeLock();
    atualizarRelogiosMundiais();
    registrarAuditoria('salao');
    carregarPrevisaoBelem();
    carregarCambio();

    // Inicia a transmissão
    voltarParaVideoPrincipal();
    setInterval(carregarCambio, 120000);
});
