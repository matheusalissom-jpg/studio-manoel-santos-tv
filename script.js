// ==========================================================================
// VISIOFLOW MEDIA - ENGINE DE TRANSMISSÃO E AUDITORIA (SCRIPT.JS)
// ==========================================================================

// 1. AUDITORIA & PROVA DE EXIBIÇÃO (PROOF OF PLAY - LOCALSTORAGE)
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

// Comando executivo para ver métricas no console
window.consultarMetricas = function() {
    const relatorio = JSON.parse(localStorage.getItem(STORAGE_KEY));
    console.table(relatorio);
    return relatorio;
};

// 2. FALLBACKS DE LOGO E IMAGENS
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

// 3. MOTOR METEOROLÓGICO DE ALTA PRECISÃO (OPEN-METEO COM EFEITOS DINÂMICOS)
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

        document.getElementById('temp-agora').innerText = tempAtual;
        document.getElementById('condicao-agora').innerText = traduzirClimaComPeriodo(codeAtual, isDayAtual).texto;
        document.getElementById('temp-hoje-max').innerText = maxHoje;
        document.getElementById('temp-hoje-min').innerText = minHoje;

        document.getElementById('clima-sensacao').innerText = sensacao;
        document.getElementById('clima-chuva-hoje').innerText = chuvaHoje;
        document.getElementById('clima-umidade-hoje').innerText = umidade;
        document.getElementById('clima-vento-hoje').innerText = vento;

        renderizarCenarioAtmosferico(codeAtual, isDayAtual);

        // Fita horária
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
                    <div class="capsula-hora">
                        <div class="hora">${horaFormatada}</div>
                        <div class="icone">${infoHora.icone}</div>
                        <div class="temp">${tempHora}°</div>
                    </div>
                `;
                adicionados++;
            }
        }
    } catch (err) {
        console.error("Falha ao sincronizar clima:", err);
    }
}

function renderizarCenarioAtmosferico(codigo, isDay) {
    const cenario = document.getElementById('cenario-clima');
    cenario.innerHTML = '';

    if (codigo >= 51) {
        for (let i = 0; i < 35; i++) {
            const gota = document.createElement('div');
            gota.className = 'gota-chuva';
            gota.style.left = `${Math.random() * 100}%`;
            gota.style.animationDelay = `${Math.random() * 1.5}s`;
            gota.style.animationDuration = `${0.8 + Math.random() * 0.5}s`;
            cenario.appendChild(gota);
        }
        return;
    }

    if (isDay === 1) {
        const solGlow = document.createElement('div');
        solGlow.className = 'sol-vivo-glow';
        cenario.appendChild(solGlow);

        const nuvem = document.createElement('div');
        nuvem.className = 'nuvem-deriva';
        nuvem.style.top = '22%';
        nuvem.style.width = '350px';
        nuvem.style.height = '140px';
        cenario.appendChild(nuvem);
        return;
    }

    const luaGlow = document.createElement('div');
    luaGlow.className = 'lua-brilho-noturno';
    cenario.appendChild(luaGlow);

    for (let i = 0; i < 25; i++) {
        const estrela = document.createElement('div');
        estrela.className = 'estrela-viva';
        const tamanho = 2 + Math.random() * 3;
        estrela.style.width = `${tamanho}px`;
        estrela.style.height = `${tamanho}px`;
        estrela.style.top = `${Math.random() * 55}%`;
        estrela.style.left = `${Math.random() * 100}%`;
        estrela.style.animationDelay = `${Math.random() * 3}s`;
        cenario.appendChild(estrela);
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

    if (codigo === 0) return { texto: "Céu Limpo com Sol", icone: "☀️" };
    if (codigo <= 3) return { texto: "Sol entre Nuvens", icone: "⛅" };
    if (codigo >= 51 && codigo <= 67) return { texto: "Chuva Passageira", icone: "🌧️" };
    if (codigo >= 80 && codigo <= 82) return { texto: "Pancadas de Chuva", icone: "🌦️" };
    if (codigo >= 95) return { texto: "Chuva com Trovoadas", icone: "⛈️" };
    return { texto: "Mormaço Tropical", icone: "☁️" };
}

// 4. ACERVO EDITORIAL: BELEZA, CABELOS, VISAGISMO & ESTILO
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

// 5. CÂMBIO EM TEMPO REAL (AWESOMEAPI)
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

// 6. MÁQUINA DE TRANSMISSÃO EM 7 FASES (GRADE COMPLETA)
const telaVideo = document.getElementById('fase-video');
const telaClima = document.getElementById('fase-clima');
const telaNoticias = document.getElementById('fase-noticias');
const telaAnuncio = document.getElementById('fase-anuncio');
const telaAgenda = document.getElementById('fase-agenda');
const telaAnuncieAqui = document.getElementById('fase-anuncie-aqui');
const telaProduto = document.getElementById('fase-produto');

const videoSalao = document.getElementById('player-video');
const videoAnuncio = document.getElementById('player-anuncio');
const videoProduto = document.getElementById('player-produto');

const todasAsTelas = [telaVideo, telaClima, telaNoticias, telaAnuncio, telaAgenda, telaAnuncieAqui, telaProduto];

function ativarApenas(telaAlvo) {
    todasAsTelas.forEach(t => {
        if (t) t.classList.remove('ativa');
    });
    if (telaAlvo) telaAlvo.classList.add('ativa');
}

function irParaClima() {
    ativarApenas(telaClima);
    carregarPrevisaoBelem();
    setTimeout(irParaNoticias, 12000);
}

function irParaNoticias() {
    ativarApenas(telaNoticias);
    trocarNoticiaVisual();
    setTimeout(irParaAnuncio, 12000);
}

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

function irParaAgenda() {
    ativarApenas(telaAgenda);
    setTimeout(irParaAnuncieAqui, 12000);
}

function irParaAnuncieAqui() {
    ativarApenas(telaAnuncieAqui);
    setTimeout(irParaProduto, 11000);
}

function irParaProduto() {
    ativarApenas(telaProduto);
    registrarAuditoria('produto_salao');
    if (videoProduto) {
        videoProduto.currentTime = 0;
        videoProduto.play().catch(() => setTimeout(voltarParaVideoPrincipal, 10000));
    } else {
        setTimeout(voltarParaVideoPrincipal, 10000);
    }
}

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
if (videoProduto) videoProduto.onended = voltarParaVideoPrincipal;

// Fallbacks de proteção
if (videoSalao) videoSalao.onerror = () => setTimeout(irParaClima, 10000);
if (videoAnuncio) videoAnuncio.onerror = () => setTimeout(irParaAgenda, 10000);
if (videoProduto) videoProduto.onerror = () => setTimeout(voltarParaVideoPrincipal, 10000);

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    registrarAuditoria('salao');
    trocarNoticiaVisual();
    carregarPrevisaoBelem();
    carregarCambio();

    if (videoSalao) {
        videoSalao.play().catch(() => console.log("Aguardando interação inicial."));
    }
    setInterval(carregarCambio, 120000);
});
