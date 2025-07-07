let scope = {};
let vozesDisponiveis = [];

export function init(appScope) {
    scope = appScope;
}

export function popularSeletorDeVozes() {
    const popular = () => {
        vozesDisponiveis = speechSynthesis.getVoices();
        scope.DOM.selectVoz.innerHTML = '';
        const vozesPt = vozesDisponiveis.filter(voz => voz.lang.startsWith('pt'));

        if (vozesPt.length === 0) {
            scope.DOM.selectVoz.innerHTML = '<option disabled>Nenhuma voz em Português</option>';
            return;
        }

        vozesPt.forEach(voz => {
            const option = document.createElement('option');
            option.textContent = `${voz.name} (${voz.lang})`;
            option.value = voz.voiceURI;
            scope.DOM.selectVoz.appendChild(option);
        });

        if (scope.dadosDoComunicador.vozSelecionadaURI) {
            scope.DOM.selectVoz.value = scope.dadosDoComunicador.vozSelecionadaURI;
        }
    };

    popular();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = popular;
    }
}

export function falarSentenca() {
    const { DOM, dadosDoComunicador, tempoVerbalAtual } = scope;
    const figurasNaFicha = [...DOM.fichaSentenca.querySelectorAll('.figura')];
    if (figurasNaFicha.length === 0) return;

    const palavras = figurasNaFicha.map(fig => fig.dataset);
    let textoFinal = [];
    let sujeito = null;

    for (const p of palavras) {
        if (p.tipoPalavra === 'pronome') {
            sujeito = p;
            break; 
        }
    }

    for (let i = 0; i < palavras.length; i++) {
        let p = palavras[i];
        if (p.tipoPalavra === 'verbo' && sujeito) {
            textoFinal.push(conjugarVerbo(p.texto, sujeito, tempoVerbalAtual, p));
        } else if (p.tipoPalavra === 'adjetivo' && i > 0 && palavras[i - 1].tipoPalavra === 'substantivo') {
            textoFinal.push(concordarAdjetivo(p.texto, palavras[i - 1]));
        } else {
            textoFinal.push(p.texto);
        }
    }

    const texto = textoFinal.join(' ');
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    
    const uriSalva = dadosDoComunicador.vozSelecionadaURI;
    if (uriSalva) {
        const vozSelecionada = vozesDisponiveis.find(voz => voz.voiceURI === uriSalva);
        if (vozSelecionada) utterance.voice = vozSelecionada;
    }
    
    speechSynthesis.speak(utterance);
}

function conjugarVerbo(verbo, sujeito, tempo, figuraVerboDataset) {
    if (figuraVerboDataset && figuraVerboDataset.irregular === 'true') {
        try {
            const conjugacoes = JSON.parse(figuraVerboDataset.conjugacoes);
            const pessoaKey = `${sujeito.pessoa}${sujeito.numero}`;

            if (conjugacoes?.[tempo]?.[pessoaKey]) {
                return conjugacoes[tempo][pessoaKey];
            }
        } catch (e) {
            console.error("Erro ao processar conjugações irregulares:", e);
        }
    }
    
    const radical = verbo.slice(0, -2);
    const terminacao = verbo.slice(-2).toLowerCase();
    const pessoa = parseInt(sujeito.pessoa);
    const numero = sujeito.numero;

    if (tempo === 'presente') {
        if (pessoa === 1 && numero === 's') return radical + 'o';
        if (pessoa === 2 && numero === 's') return radical + (terminacao === 'ar' ? 'as' : 'es');
        if (pessoa === 3 && numero === 's') return radical + (terminacao === 'ar' ? 'a' : 'e');
        if (pessoa === 1 && numero === 'p') {
            if (terminacao === 'ar') return radical + 'amos';
            if (terminacao === 'er') return radical + 'emos';
            if (terminacao === 'ir') return radical + 'imos';
        }
        if (pessoa === 3 && numero === 'p') return radical + (terminacao === 'ar' ? 'am' : 'em');
    }
    if (tempo === 'passado') {
        if (terminacao === 'ar') {
            if (pessoa === 1 && numero === 's') return radical + 'ei';
            if (pessoa === 3 && numero === 's') return radical + 'ou';
            if (pessoa === 1 && numero === 'p') return radical + 'amos';
            if (pessoa === 3 && numero === 'p') return radical + 'aram';
        } else {
            if (pessoa === 1 && numero === 's') return radical + 'i';
            if (pessoa === 3 && numero === 's') return radical + 'eu';
            if (pessoa === 1 && numero === 'p') return radical + 'emos';
            if (pessoa === 3 && numero === 'p') return radical + 'eram';
        }
    }
    if (tempo === 'futuro') {
        if (pessoa === 1 && numero === 's') return verbo + 'ei';
        if (pessoa === 3 && numero === 's') return verbo + 'á';
        if (pessoa === 1 && numero === 'p') return verbo + 'emos';
        if (pessoa === 3 && numero === 'p') return verbo + 'ão';
    }
    
    return verbo;
}

function concordarAdjetivo(adjetivo, substantivo) {
    if (substantivo && substantivo.genero === 'f' && adjetivo.slice(-1) === 'o') {
        return adjetivo.slice(0, -1) + 'a';
    }
    return adjetivo;
}