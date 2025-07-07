import * as ui from './ui.js';
import * as speech from './speech.js';

const scope = {
    modoEdicao: false,
    editClickCount: 0,
    figuraSendoEditada: { id: null, tempTipo: null, tempDado: null },
    dadosDoComunicador: {},
    caminhoNavegacao: [],
    tempoVerbalAtual: 'presente',
    DADOS_INICIAIS: {},
    temposVerbais: ['presente', 'futuro', 'passado'],
    emojiTempoMap: { presente: '▶️', futuro: '⏩', passado: '⏪' },
    DOM: {},
    funcs: {}
};

// --- Funções de Importar/Exportar ---

async function exportarDadosParaZip() {
    try {
        const zip = new JSZip();
        
        // Adiciona apenas a navegação e as figuras ao zip
        const dadosParaExportar = {
            navegacao: scope.dadosDoComunicador.navegacao,
            figuras: scope.dadosDoComunicador.figuras,
            vozSelecionadaURI: scope.dadosDoComunicador.vozSelecionadaURI
        };

        zip.file("dados_comunicador.json", JSON.stringify(dadosParaExportar, null, 2));

        const conteudoZip = await zip.generateAsync({ type: "blob" });
        
        const link = document.createElement("a");
        link.href = URL.createObjectURL(conteudoZip);
        link.download = `backup_comunicador_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.zip`;
        link.click();

        URL.revokeObjectURL(link.href);
         ui.showAcaoCategoriaModal({ type: 'alert', title: 'Sucesso', message: 'Dados exportados com sucesso!' });

    } catch (error) {
        console.error("Erro ao exportar dados:", error);
        ui.showAcaoCategoriaModal({ type: 'alert', title: 'Erro', message: `Não foi possível exportar os dados. Detalhes: ${error.message}` });
    }
}

function importarDadosDeZip(ficheiro) {
    const zip = new JSZip();
    zip.loadAsync(ficheiro)
        .then(async (zipCarregado) => {
            const ficheiroDados = zipCarregado.file("dados_comunicador.json");
            if (!ficheiroDados) {
                throw new Error("O ficheiro 'dados_comunicador.json' não foi encontrado dentro do .zip.");
            }
            const conteudo = await ficheiroDados.async("string");
            const dadosImportados = JSON.parse(conteudo);

            // Validação básica dos dados importados
            if (!dadosImportados.navegacao || !dadosImportados.figuras) {
                throw new Error("O JSON importado não contém as chaves 'navegacao' e 'figuras'.");
            }
            
            // Atualiza os dados do comunicador
            scope.dadosDoComunicador.navegacao = dadosImportados.navegacao;
            scope.dadosDoComunicador.figuras = dadosImportados.figuras;
            scope.dadosDoComunicador.vozSelecionadaURI = dadosImportados.vozSelecionadaURI || null;
            
            scope.funcs.salvarDados();
            scope.caminhoNavegacao = [];
            ui.atualizarInterfaceCompleta();
            speech.popularSeletorDeVozes();

            ui.showAcaoCategoriaModal({ type: 'alert', title: 'Sucesso', message: 'Dados importados e carregados com sucesso!' });
        })
        .catch(error => {
            console.error("Erro ao importar dados:", error);
            ui.showAcaoCategoriaModal({ type: 'alert', title: 'Erro na Importação', message: `Não foi possível ler o ficheiro .zip. Verifique o formato e tente novamente. Detalhes: ${error.message}` });
        });
}


// --- Funções de Manipulação de Dados ---
scope.funcs = {
    salvarDados: () => localStorage.setItem('comunicadorDadosV22', JSON.stringify(scope.dadosDoComunicador)),
    setModoEdicao: (val) => { scope.modoEdicao = val; if (!val) scope.editClickCount = 0; },
    setFiguraSendoEditada: (val) => { scope.figuraSendoEditada = { ...scope.figuraSendoEditada, ...val }; },
    setTempoVerbal: (val) => { scope.tempoVerbalAtual = val; },
    setNavegacao: (val) => { scope.caminhoNavegacao = val; },
    // ... (restante das funções como carregarDados, removerFigura, etc.)
    carregarDados: () => {
        const dadosSalvos = localStorage.getItem('comunicadorDadosV22');
        if (dadosSalvos) {
            scope.dadosDoComunicador = JSON.parse(dadosSalvos);
            if (!scope.dadosDoComunicador.emojis || scope.dadosDoComunicador.emojis.length === 0) {
                scope.dadosDoComunicador.emojis = scope.DADOS_INICIAIS.emojis;
            }
        } else {
            scope.dadosDoComunicador = JSON.parse(JSON.stringify(scope.DADOS_INICIAIS));
        }
        ui.atualizarInterfaceCompleta();
    },

    removerFigura: (figuraId) => {
        const figura = scope.dadosDoComunicador.figuras.find(f => f.id === figuraId);
        ui.showAcaoCategoriaModal({
            type: 'confirm',
            title: 'Apagar Figura',
            message: `Tem a certeza que quer apagar a figura "${figura?.texto}"?`
        }).then(() => {
            scope.dadosDoComunicador.figuras = scope.dadosDoComunicador.figuras.filter(f => f.id !== figuraId);
            scope.funcs.salvarDados();
            ui.atualizarInterfaceCompleta();
        }).catch(() => {});
    },

    adicionarSubcategoria: async (caminho) => {
        try {
            const result = await ui.showAcaoCategoriaModal({ type: 'add', title: 'Adicionar Nova Categoria' });
            if (!result.nome) return;

            let nivel = scope.dadosDoComunicador.navegacao;
            for (const key of caminho) {
                if (!nivel[key].sub) nivel[key].sub = {};
                nivel = nivel[key].sub;
            }

            if (nivel[result.nome]) {
                return ui.showAcaoCategoriaModal({ type: 'alert', title: 'Erro', message: 'Uma categoria com este nome já existe.' });
            }

            nivel[result.nome] = { emoji: result.emoji || '📁', sub: null };
            scope.funcs.salvarDados();
            ui.renderizarGestorCategorias();
        } catch (e) {}
    },
    
    editarCategoria: async (caminho) => {
        const nomeAntigo = caminho[caminho.length - 1];
        let nivelPai = scope.dadosDoComunicador.navegacao;
        for (let i = 0; i < caminho.length - 1; i++) {
            nivelPai = nivelPai[caminho[i]].sub;
        }
        const dadosCategoria = nivelPai[nomeAntigo];

        try {
            const result = await ui.showAcaoCategoriaModal({
                type: 'edit',
                title: 'Editar Categoria',
                nome: nomeAntigo,
                emoji: dadosCategoria.emoji
            });
            const { nome: nomeNovo, emoji: emojiNovo } = result;
            
            if (!nomeNovo) return;

            if (nomeNovo !== nomeAntigo && nivelPai[nomeNovo]) {
                 return ui.showAcaoCategoriaModal({ type: 'alert', title: 'Erro', message: 'Uma categoria com este nome já existe.' });
            }
            
            const newNivelPai = {};
            for (const key in nivelPai) {
                if (key === nomeAntigo) {
                    newNivelPai[nomeNovo] = { ...nivelPai[key], emoji: emojiNovo || nivelPai[key].emoji };
                } else {
                    newNivelPai[key] = nivelPai[key];
                }
            }
            
            if (caminho.length === 1) {
                scope.dadosDoComunicador.navegacao = newNivelPai;
            } else {
                let objParaAtualizar = scope.dadosDoComunicador.navegacao;
                for (let i = 0; i < caminho.length - 2; i++) {
                     objParaAtualizar = objParaAtualizar[caminho[i]].sub;
                }
                 objParaAtualizar[caminho[caminho.length - 2]].sub = newNivelPai;
            }

            scope.dadosDoComunicador.figuras.forEach(fig => {
                (fig.caminhos || []).forEach(caminhoFig => {
                    if (caminho.every((val, i) => val === caminhoFig[i])) {
                        caminhoFig[caminho.length - 1] = nomeNovo;
                    }
                });
            });

            if (caminho.every((val, i) => val === scope.caminhoNavegacao[i])) {
                 scope.caminhoNavegacao[caminho.length - 1] = nomeNovo;
            }

            scope.funcs.salvarDados();
            ui.renderizarGestorCategorias();
            ui.atualizarInterfaceCompleta();
        } catch(e) {}
    },

    apagarCategoria: async (caminho) => {
        try {
            await ui.showAcaoCategoriaModal({
                type: 'confirm',
                title: 'Apagar Categoria',
                message: `Tem a certeza que quer apagar a categoria "${caminho[caminho.length - 1]}"?`
            });

            let nivelPai = scope.dadosDoComunicador.navegacao;
            for (let i = 0; i < caminho.length - 1; i++) {
                nivelPai = nivelPai[caminho[i]].sub;
            }
            delete nivelPai[caminho[caminho.length - 1]];

            scope.dadosDoComunicador.figuras.forEach(fig => {
                if (fig.caminhos) {
                    fig.caminhos = fig.caminhos.filter(c => !c.join(',').startsWith(caminho.join(',')));
                }
            });

            if (scope.caminhoNavegacao.join(',').startsWith(caminho.join(','))) {
                scope.caminhoNavegacao = [];
            }
            
            scope.funcs.salvarDados();
            ui.renderizarGestorCategorias();
            ui.atualizarInterfaceCompleta();
        } catch(e) {}
    }
};

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
    const getEl = (id) => document.getElementById(id);
    scope.DOM = {
        getEl,
        caixaFiguras: getEl('caixa-de-figuras'),
        fichaSentenca: getEl('ficha-de-sentenca'),
        btnFalar: getEl('btn-falar'),
        btnLimpar: getEl('btn-limpar'),
        btnToggleEdicao: getEl('btn-toggle-edicao'),
        btnHome: getEl('btn-home'),
        btnAddFigura: getEl('btn-add-figura'),
        btnGerenciarDados: getEl('btn-gerenciar-dados'),
        btnExportar: getEl('btn-exportar'),
        btnImportar: getEl('btn-importar'),
        btnApagarTudo: getEl('btn-apagar-tudo'),
        selectVoz: getEl('select-voz'),
        caminhoNavegacaoDiv: getEl('caminho-navegacao'),
        btnNavegar: getEl('btn-navegar'),
        btnCicloTempo: getEl('btn-ciclo-tempo'),
        modalEdicao: getEl('modal-edicao'),
        modalGerenciar: getEl('modal-gerenciar'),
        modalAcaoCategoria: getEl('modal-acao-categoria'),
        menuOverlay: getEl('menu-overlay'),
        inputImportarZip: getEl('input-importar-zip'),
    };

    try {
        const [nav, figs, emjs] = await Promise.all([
            fetch('dados/navegacao.json').then(res => res.json()),
            fetch('dados/figuras.json').then(res => res.json()),
            fetch('dados/emojis.json').then(res => res.json())
        ]);
        scope.DADOS_INICIAIS = { navegacao: nav, figuras: figs, emojis: emjs, vozSelecionadaURI: null };
    } catch (error) {
        document.body.innerHTML = "<h1>Erro Crítico</h1><p>Não foi possível carregar os dados. Verifique o formato dos seus ficheiros JSON e a consola para mais detalhes.</p>";
        console.error("Falha ao carregar dados iniciais:", error);
        return;
    }

    ui.init(scope);
    speech.init(scope);
    scope.funcs.carregarDados();
    ui.definirTempoVerbal(scope.tempoVerbalAtual);
    ui.setupDragMenu(scope.DOM.btnNavegar);
    ui.setupFichaSentencaListeners(); 
    speech.popularSeletorDeVozes();

    // --- EVENT LISTENERS ---
    scope.DOM.btnFalar.addEventListener('click', speech.falarSentenca);
    scope.DOM.btnLimpar.addEventListener('click', ui.limparFicha);
    scope.DOM.btnAddFigura.onclick = () => ui.openModalEdicao(null);
    scope.DOM.btnGerenciarDados.onclick = () => {
        ui.renderizarGestorCategorias();
        scope.DOM.modalGerenciar.style.display = 'flex';
    };
    scope.DOM.getEl('btn-add-cat-raiz').onclick = () => scope.funcs.adicionarSubcategoria([]);
    scope.DOM.btnToggleEdicao.addEventListener('click', () => {
        if (scope.modoEdicao) {
            ui.toggleModoEdicao(true);
        } else {
            scope.editClickCount++;
            if (scope.editClickCount >= 4) ui.toggleModoEdicao();
        }
    });
    scope.DOM.btnCicloTempo.onclick = () => {
        const currentIndex = scope.temposVerbais.indexOf(scope.tempoVerbalAtual);
        const nextIndex = (currentIndex + 1) % scope.temposVerbais.length;
        ui.definirTempoVerbal(scope.temposVerbais[nextIndex]);
    };
    scope.DOM.btnHome.addEventListener('click', () => {
        scope.caminhoNavegacao = [];
        ui.atualizarInterfaceCompleta();
    });
    scope.DOM.selectVoz.addEventListener('change', () => {
        scope.dadosDoComunicador.vozSelecionadaURI = scope.DOM.selectVoz.value;
        scope.funcs.salvarDados();
    });
    document.querySelectorAll('.modal .close-button').forEach(btn => btn.onclick = () => btn.closest('.modal').style.display = 'none');
    
    // --- EVENT LISTENERS PARA IMPORTAR/EXPORTAR ---
    scope.DOM.btnExportar.addEventListener('click', exportarDadosParaZip);
    scope.DOM.btnImportar.addEventListener('click', () => scope.DOM.inputImportarZip.click());
    scope.DOM.inputImportarZip.addEventListener('change', (e) => {
        const ficheiro = e.target.files[0];
        if (ficheiro) {
            importarDadosDeZip(ficheiro);
        }
        e.target.value = ''; // Limpa o input para permitir importar o mesmo ficheiro novamente
    });

    scope.DOM.getEl('btn-salvar-figura').onclick = () => {
        const texto = scope.DOM.getEl('input-texto-figura').value.trim();
        if (!texto || !scope.figuraSendoEditada.tempDado) {
            return ui.showAcaoCategoriaModal({ type: 'alert', title: 'Erro', message: 'Preencha o texto e selecione uma imagem.' });
        }
        const caminhosStr = scope.DOM.getEl('input-caminho-figura').value.trim();
        const caminhos = caminhosStr === '' ? [[]] : caminhosStr.split(';').map(p => p.split(',').map(s => s.trim()).filter(Boolean)).filter(a => a.length > 0);
        if (caminhos.length === 0) caminhos.push([]);

        const tipoPalavra = scope.DOM.getEl('select-tipo-palavra').value;
        const novaData = {
            texto,
            caminhos,
            tipo: scope.figuraSendoEditada.tempTipo,
            dado: scope.figuraSendoEditada.tempDado,
            tipoPalavra: tipoPalavra,
        };

        if (tipoPalavra === 'substantivo') {
            novaData.genero = scope.DOM.getEl('input-genero-substantivo').value;
        } else if (tipoPalavra === 'verbo') {
            const isIrregular = scope.DOM.getEl('input-verbo-irregular').checked;
            novaData.irregular = isIrregular;
            if (isIrregular) {
                novaData.conjugacoes = {};
                const tempos = ['presente', 'passado', 'futuro'];
                const pessoas = ['1s', '2s', '3s', '1p', '3p'];
                tempos.forEach(tempo => {
                    novaData.conjugacoes[tempo] = {};
                    pessoas.forEach(pessoa => {
                        const input = scope.DOM.getEl(`conj-${tempo}-${pessoa}`);
                        if (input && input.value.trim()) {
                            novaData.conjugacoes[tempo][pessoa] = input.value.trim();
                        }
                    });
                });
            }
        }
        
        if (scope.figuraSendoEditada.id) {
            const index = scope.dadosDoComunicador.figuras.findIndex(f => f.id === scope.figuraSendoEditada.id);
            if (index > -1) {
                const figuraAntiga = scope.dadosDoComunicador.figuras[index];
                delete figuraAntiga.genero;
                delete figuraAntiga.irregular;
                delete figuraAntiga.conjugacoes;
                scope.dadosDoComunicador.figuras[index] = { ...figuraAntiga, ...novaData };
            }
        } else {
            scope.dadosDoComunicador.figuras.push({ ...novaData, id: `f-${Date.now()}` });
        }
        
        scope.funcs.salvarDados();
        ui.atualizarInterfaceCompleta();
        scope.DOM.modalEdicao.style.display = 'none';
    };

    let buscaTimeout;
    scope.DOM.getEl('input-busca-unificada').oninput = (e) => {
        clearTimeout(buscaTimeout);
        const termo = e.target.value.trim();
        ui.buscarEmojis(termo);
        ui.buscarArasaac(termo);
    };
    
    scope.DOM.getEl('input-url-imagem').onchange = (e) => scope.funcs.setFiguraSendoEditada({ tempTipo: 'img', tempDado: e.target.value });
    scope.DOM.getEl('input-upload-imagem').onchange = (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (event) => scope.funcs.setFiguraSendoEditada({ tempTipo: 'img', tempDado: event.target.result });
            reader.readAsDataURL(file);
        }
    };

    scope.DOM.btnApagarTudo.onclick = async () => {
        try {
            await ui.showAcaoCategoriaModal({ type: 'confirm', title: 'Apagar Tudo', message: 'Tem a certeza que quer apagar todos os dados?' });
            scope.dadosDoComunicador = JSON.parse(JSON.stringify(scope.DADOS_INICIAIS));
            scope.funcs.salvarDados();
            scope.caminhoNavegacao = [];
            ui.atualizarInterfaceCompleta();
        } catch (e) {}
    };
});