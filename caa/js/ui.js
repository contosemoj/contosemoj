// Este módulo depende do 'scope' partilhado que é injetado pelo main.js
let scope = {};
let draggedIcon = null;
let dropTarget = null;
let activeSubMenuParent = null;
let submenuCloseTimeoutId = null;

// --- Funções Auxiliares para a Nova UI de Edição ---

function atualizarCamposGramatica() {
    const { DOM, figuraSendoEditada, dadosDoComunicador } = scope;
    const tipoPalavra = DOM.getEl('select-tipo-palavra').value;
    const container = DOM.getEl('campos-gramatica');
    container.innerHTML = ''; // Limpa os campos antigos

    const figura = figuraSendoEditada.id ? dadosDoComunicador.figuras.find(f => f.id === figuraSendoEditada.id) : null;

    if (tipoPalavra === 'substantivo') {
        container.innerHTML = `
            <div class="grupo-campo">
                <label for="input-genero-substantivo">Gênero:</label>
                <select id="input-genero-substantivo">
                    <option value="m" ${figura?.genero === 'm' ? 'selected' : ''}>Masculino</option>
                    <option value="f" ${figura?.genero === 'f' ? 'selected' : ''}>Feminino</option>
                </select>
            </div>`;
    } else if (tipoPalavra === 'verbo') {
        const isIrregular = figura?.irregular || false;
        container.innerHTML = `
            <div class="grupo-campo">
                <label style="cursor:pointer; display:flex; align-items:center; gap: 8px;">
                    <input type="checkbox" id="input-verbo-irregular" ${isIrregular ? 'checked' : ''}> É um verbo irregular?
                </label>
            </div>
            <div id="conjugacoes-irregulares" style="display:${isIrregular ? 'block' : 'none'}; border-left: 3px solid var(--cor-primaria); padding-left: 15px; margin-top: 1rem;">
                </div>`;
        
        const checkbox = container.querySelector('#input-verbo-irregular');
        checkbox.addEventListener('change', (e) => {
            const conjugacoesDiv = document.getElementById('conjugacoes-irregulares');
            if (e.target.checked) {
                conjugacoesDiv.style.display = 'block';
                if (conjugacoesDiv.innerHTML.trim() === '') {
                   popularCamposConjugacao(figura?.conjugacoes);
                }
            } else {
                conjugacoesDiv.style.display = 'none';
            }
        });
        
        if (isIrregular) {
            const conjugacoesExistentes = figura.conjugacoes && typeof figura.conjugacoes === 'object' ? figura.conjugacoes : {};
            popularCamposConjugacao(conjugacoesExistentes);
        }
    }
}

function popularCamposConjugacao(conjugacoes = {}) {
    const container = document.getElementById('conjugacoes-irregulares');
    if (!container) return; // Garante que o container existe
    const tempos = ['presente', 'passado', 'futuro'];
    const pessoas = { '1s': 'Eu', '2s': 'Você', '3s': 'Ele/Ela', '1p': 'Nós', '3p': 'Eles/Elas' };

    let html = '<h4>Conjugações Específicas:</h4><p><small>Preencha apenas as que diferem do padrão. O sistema usará a conjugação regular para os campos em branco.</small></p>';
    tempos.forEach(tempo => {
        html += `<h5>${tempo.charAt(0).toUpperCase() + tempo.slice(1)}</h5>`;
        html += '<div class="grupo-conjugacao" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';
        Object.keys(pessoas).forEach(pessoaKey => {
            const valor = (conjugacoes && conjugacoes[tempo] && conjugacoes[tempo][pessoaKey]) ? conjugacoes[tempo][pessoaKey] : '';
            html += `
                <div class="campo-conjugacao" style="display: flex; flex-direction: column;">
                    <label for="conj-${tempo}-${pessoaKey}">${pessoas[pessoaKey]}:</label>
                    <input type="text" id="conj-${tempo}-${pessoaKey}" value="${valor}" placeholder="padrão regular">
                </div>`;
        });
        html += '</div>';
    });
    container.innerHTML = html;
}


// --- Resto do código do ui.js ---

export function setupFichaSentencaListeners() {
    const { DOM } = scope;
    DOM.fichaSentenca.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        e.currentTarget.classList.add('drag-over'); 
    });
    DOM.fichaSentenca.addEventListener('dragleave', (e) => { 
        e.currentTarget.classList.remove('drag-over'); 
    });
    DOM.fichaSentenca.addEventListener('drop', (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const dataJSON = e.dataTransfer.getData('application/json');
        if (dataJSON) {
            const data = JSON.parse(dataJSON);
            const figuraArrastadaData = {};
            for (const key in data) {
                try {
                    figuraArrastadaData[key] = JSON.parse(data[key]);
                } catch {
                    figuraArrastadaData[key] = data[key];
                }
            }
            const clone = criarElementoFigura(figuraArrastadaData);
            clone.draggable = false;
            clone.querySelector('.btn-remover')?.remove();
            DOM.fichaSentenca.appendChild(clone);
        }
    });
}

export function init(appScope) {
    scope = appScope;
}

export function atualizarInterfaceCompleta() {
    const { dadosDoComunicador, caminhoNavegacao, DOM } = scope;
    if (!dadosDoComunicador || !dadosDoComunicador.navegacao) return;

    DOM.caminhoNavegacaoDiv.textContent = caminhoNavegacao.length > 0 ? caminhoNavegacao.join(' > ') : 'Página Inicial';

    let emojiAtual = '⭐';
    if (caminhoNavegacao.length > 0) {
        const ultimoNivelKey = caminhoNavegacao[caminhoNavegacao.length - 1];
        let nivelPai = dadosDoComunicador.navegacao;
        for(let i=0; i < caminhoNavegacao.length - 1; i++){
            if (nivelPai[caminhoNavegacao[i]]) {
                nivelPai = nivelPai[caminhoNavegacao[i]].sub;
            } else {
                nivelPai = null;
                break;
            }
        }
        if (nivelPai && nivelPai[ultimoNivelKey]) {
            emojiAtual = nivelPai[ultimoNivelKey]?.emoji || '📁';
        }
    }
    DOM.btnNavegar.querySelector('.emoji').textContent = emojiAtual;
    renderizarFigurasFiltradas();
}

function renderizarFigurasFiltradas() {
    const { dadosDoComunicador, DOM, caminhoNavegacao } = scope;
    DOM.caixaFiguras.innerHTML = '';
    if (!dadosDoComunicador.figuras) return;

    const figurasFiltradas = dadosDoComunicador.figuras.filter(fig => {
        const figCaminhos = fig.caminhos || [];
        const isPathMatch = (individualPath) => {
            if (caminhoNavegacao.length !== individualPath.length) return false;
            return caminhoNavegacao.every((val, i) => val === individualPath[i]);
        };
        return figCaminhos.some(isPathMatch);
    });

    if (figurasFiltradas.length > 0) {
        figurasFiltradas.forEach(data => DOM.caixaFiguras.appendChild(criarElementoFigura(data)));
    } else {
        DOM.caixaFiguras.innerHTML = '<p style="color: #888; text-align: center; width: 100%;">Nenhuma figura nesta categoria.</p>';
    }
}

function separarEmojis(str) {
    if (!str) return [];
    const regex = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\uFE0F\u20E3?|[\uE0020-\uE007E]+\uE007F)?/gu;
    return str.match(regex) || [];
}

function criarElementoFigura(figuraData) {
    const { DOM, funcs, modoEdicao } = scope;
    const fig = document.createElement('div');
    fig.className = 'figura';

    const dataForDataset = { ...figuraData };
    Object.keys(dataForDataset).forEach(key => {
        const value = dataForDataset[key];
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            fig.dataset[key] = JSON.stringify(value);
        } else {
            fig.dataset[key] = value;
        }
    });

    fig.draggable = !modoEdicao;

    const imagemContainer = document.createElement('div');
    imagemContainer.className = 'imagem-container';

    if (figuraData.tipo === 'emoji') {
        const emojis = separarEmojis(figuraData.dado);
        const emojiCount = emojis.length;
        
        let innerHTML;
        if (emojiCount > 1) {
            const emojiSpans = emojis.map(e => `<span class="emoji-ind">${e}</span>`).join('');
            innerHTML = `<span class="emoji-display emoji-count-${emojiCount}">${emojiSpans}</span>`;
        } else {
            innerHTML = `<span class="emoji-display">${figuraData.dado}</span>`;
        }
        imagemContainer.innerHTML = innerHTML;
    } else {
        imagemContainer.innerHTML = `<img src="${figuraData.dado}" alt="${figuraData.texto}" onerror="this.parentElement.innerHTML='<p>🖼️</p>';">`;
    }

    const textoP = document.createElement('p');
    textoP.textContent = figuraData.texto;
    const btnRemover = document.createElement('button');
    btnRemover.className = 'btn-remover';
    btnRemover.innerHTML = '&times;';
    btnRemover.onclick = (e) => { e.stopPropagation(); funcs.removerFigura(figuraData.id); };
    fig.append(btnRemover, imagemContainer, textoP);

    fig.addEventListener('dragstart', (e) => {
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.setData('application/json', JSON.stringify(e.currentTarget.dataset));
    });

    fig.addEventListener('dragend', (e) => e.currentTarget.classList.remove('dragging'));

    fig.addEventListener('click', (e) => {
        if (scope.modoEdicao) {
            openModalEdicao(e.currentTarget.dataset.id);
        } else {
            const figuraClicadaData = {};
            for (const key in e.currentTarget.dataset) {
                try {
                    figuraClicadaData[key] = JSON.parse(e.currentTarget.dataset[key]);
                } catch {
                    figuraClicadaData[key] = e.currentTarget.dataset[key];
                }
            }
            const clone = criarElementoFigura(figuraClicadaData);
            clone.draggable = false;
            clone.querySelector('.btn-remover')?.remove();
            DOM.fichaSentenca.appendChild(clone);
        }
    });
    
    return fig;
}

export function openModalEdicao(figuraId) {
    const { dadosDoComunicador, funcs, DOM } = scope;
    const figura = figuraId ? dadosDoComunicador.figuras.find(f => f.id === figuraId) : null;
    funcs.setFiguraSendoEditada({ id: figuraId, tempTipo: figura?.tipo, tempDado: figura?.dado });

    DOM.modalEdicao.style.display = 'flex';
    DOM.getEl('input-texto-figura').value = figura?.texto || '';
    DOM.getEl('input-caminho-figura').value = (figura?.caminhos || []).map(p => p.join(',')).join(';');
    DOM.getEl('select-tipo-palavra').value = figura?.tipoPalavra || 'substantivo';

    // Chama a função para criar os campos e adiciona o listener para quando mudar a seleção
    atualizarCamposGramatica();
    DOM.getEl('select-tipo-palavra').onchange = atualizarCamposGramatica;
    
    DOM.getEl('input-busca-unificada').value = '';
    DOM.getEl('arasaac-resultados').innerHTML = '';
    DOM.getEl('emoji-resultados').innerHTML = '';
    DOM.getEl('input-url-imagem').value = '';
    DOM.getEl('input-upload-imagem').value = '';
}

export function toggleModoEdicao(forceOff = false) {
    const { funcs, DOM } = scope;
    const novoModo = forceOff ? false : !scope.modoEdicao;
    funcs.setModoEdicao(novoModo);
    DOM.btnToggleEdicao.innerHTML = novoModo ? '🔓' : '🔒';
    document.body.classList.toggle('modo-edicao', novoModo);
    atualizarInterfaceCompleta();
}

export function showAcaoCategoriaModal(options) {
    const { DOM } = scope;
    return new Promise((resolve, reject) => {
        const { type, title, message = '', nome = '', emoji = '' } = options;
        DOM.getEl('acao-cat-titulo').textContent = title;
        DOM.getEl('acao-cat-mensagem').style.display = message ? 'block' : 'none';
        DOM.getEl('acao-cat-mensagem').textContent = message;

        const inputNome = DOM.getEl('acao-cat-input-nome');
        const inputEmoji = DOM.getEl('acao-cat-input-emoji');
        inputNome.value = nome;
        inputEmoji.value = emoji;
        inputNome.style.display = (type === 'add' || type === 'edit') ? 'block' : 'none';
        inputEmoji.style.display = (type === 'add' || type === 'edit') ? 'block' : 'none';

        DOM.modalAcaoCategoria.style.display = 'flex';

        const onConfirm = () => { cleanup(); resolve({ nome: inputNome.value.trim(), emoji: inputEmoji.value.trim() }); };
        const onCancel = () => { cleanup(); reject(); };
        const cleanup = () => {
            DOM.getEl('acao-cat-confirmar').removeEventListener('click', onConfirm);
            DOM.getEl('acao-cat-cancelar').removeEventListener('click', onCancel);
            DOM.modalAcaoCategoria.style.display = 'none';
        };

        DOM.getEl('acao-cat-confirmar').addEventListener('click', onConfirm, { once: true });
        DOM.getEl('acao-cat-cancelar').addEventListener('click', onCancel, { once: true });
    });
}

export function renderizarGestorCategorias() {
    const { DOM, dadosDoComunicador } = scope;
    const container = DOM.getEl('lista-categorias');
    container.innerHTML = '';
    const ul = document.createElement('ul');
    for (const key in dadosDoComunicador.navegacao) {
        ul.appendChild(criarItemCategoria(key, dadosDoComunicador.navegacao[key], [key]));
    }
    container.appendChild(ul);
}

function criarItemCategoria(key, data, caminho) {
    const { funcs } = scope;
    const li = document.createElement('li');
    li.innerHTML = `<span>${data.emoji || '📁'} ${key}</span>
                    <div class="controles-categoria">
                        <button class="btn-add-subcat" title="Adicionar Subcategoria">➕</button>
                        <button class="btn-edit-cat" title="Editar Categoria">✏️</button>
                        <button class="btn-delete-cat" title="Apagar Categoria">🗑️</button>
                    </div>`;
    li.querySelector('.btn-add-subcat').onclick = () => funcs.adicionarSubcategoria(caminho);
    li.querySelector('.btn-edit-cat').onclick = () => funcs.editarCategoria(caminho);
    li.querySelector('.btn-delete-cat').onclick = () => funcs.apagarCategoria(caminho);
    if (data.sub && Object.keys(data.sub).length > 0) {
        const subUl = document.createElement('ul');
        for (const subKey in data.sub) {
            subUl.appendChild(criarItemCategoria(subKey, data.sub[subKey], [...caminho, subKey]));
        }
        li.appendChild(subUl);
    }
    return li;
}

export function definirTempoVerbal(tempo) {
    const { funcs, DOM, emojiTempoMap } = scope;
    funcs.setTempoVerbal(tempo);
    const classList = ['tense-passado', 'tense-presente', 'tense-futuro'];
    DOM.btnCicloTempo.classList.remove(...classList);
    DOM.btnCicloTempo.classList.add(`tense-${tempo}`);
    DOM.btnCicloTempo.innerHTML = emojiTempoMap[tempo];
    DOM.fichaSentenca.classList.remove(...classList);
    DOM.fichaSentenca.classList.add(`tense-${tempo}`);
}

export function limparFicha() {
    scope.DOM.fichaSentenca.innerHTML = '';
}

export async function buscarArasaac(termo) {
    const { DOM, funcs } = scope;
    const resultadosDiv = DOM.getEl('arasaac-resultados');
    if (termo.length < 3) {
        resultadosDiv.innerHTML = '';
        return;
    };
    resultadosDiv.innerHTML = '<div class="loading">Buscando...</div>';
    try {
        const response = await fetch(`https://api.arasaac.org/v1/pictograms/pt/search/${encodeURIComponent(termo)}`);
        if (!response.ok) throw new Error('Erro na rede');
        const pictos = await response.json();
        resultadosDiv.innerHTML = pictos.length === 0 ? '<p>Nenhum resultado.</p>' : '';
        pictos.slice(0, 20).forEach(picto => {
            const img = document.createElement('img');
            img.src = `https://api.arasaac.org/v1/pictograms/${picto._id}`;
            img.onclick = () => {
                funcs.setFiguraSendoEditada({ tempTipo: 'img', tempDado: img.src });
                document.querySelectorAll('#emoji-resultados span, #arasaac-resultados img').forEach(i => i.classList.remove('selecionado'));
                img.classList.add('selecionado');
            };
            resultadosDiv.appendChild(img);
        });
    } catch (error) { resultadosDiv.innerHTML = '<p>Falha ao buscar.</p>'; }
}

export function buscarEmojis(termo) {
    const { dadosDoComunicador, DOM, funcs } = scope;
    const resultadosDiv = DOM.getEl('emoji-resultados');
    if (!termo || !dadosDoComunicador.emojis) return;
    const emojisFiltrados = dadosDoComunicador.emojis.filter(item =>
        item.keywords.some(k => k.toLowerCase().includes(termo.toLowerCase()))
    );
    resultadosDiv.innerHTML = emojisFiltrados.length === 0 ? '<p>Nenhum emoji encontrado.</p>' : '';
    emojisFiltrados.slice(0, 50).forEach(item => {
        const span = document.createElement('span');
        span.textContent = item.emoji;
        span.onclick = () => {
            funcs.setFiguraSendoEditada({ tempTipo: 'emoji', tempDado: item.emoji });
            document.querySelectorAll('#emoji-resultados span, #arasaac-resultados img').forEach(i => i.classList.remove('selecionado'));
            span.classList.add('selecionado');
        };
        resultadosDiv.appendChild(span);
    });
}

export function setupDragMenu(triggerBtn) {
    const { DOM, dadosDoComunicador, caminhoNavegacao, funcs } = scope;

    const onDragStart = (e) => {
        e.preventDefault();
        const menuInitialRect = triggerBtn.getBoundingClientRect();
        abrirMenuRadial(menuInitialRect);
        draggedIcon = document.createElement('div');
        draggedIcon.id = 'dragged-icon';
        draggedIcon.innerHTML = triggerBtn.innerHTML;
        document.body.appendChild(draggedIcon);
        const { pageX, pageY } = e.touches ? e.touches[0] : e;
        moveDraggedIcon(pageX, pageY);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);
    };

    const onDragMove = (e) => {
        e.preventDefault();
        const { clientX, clientY } = e.touches ? e.touches[0] : e;
        moveDraggedIcon(clientX, clientY);
        const elementBelow = document.elementFromPoint(clientX, clientY);
        const currentHoverTarget = elementBelow ? elementBelow.closest('.menu-option, .menu-cancel-btn') : null;

        if (dropTarget !== currentHoverTarget) {
            if (dropTarget) dropTarget.classList.remove('drop-target');
            if (currentHoverTarget) currentHoverTarget.classList.add('drop-target');
            dropTarget = currentHoverTarget;
        }

        clearTimeout(submenuCloseTimeoutId);
        const parentMenuItem = elementBelow ? elementBelow.closest('.menu-option') : null;

        if (!parentMenuItem) {
            if(activeSubMenuParent) {
                submenuCloseTimeoutId = setTimeout(closeActiveSubMenu, 500);
            }
            return;
        }

        if (parentMenuItem !== activeSubMenuParent) {
            handleSubMenuOpening(parentMenuItem);
        }
    };

    const handleSubMenuOpening = (parentMenuItem) => {
        const newParentPath = parentMenuItem.dataset.path;
        document.querySelectorAll('.submenu-item').forEach(item => {
            if (item !== parentMenuItem && !newParentPath.startsWith(item.dataset.path)) {
                item.remove();
            }
        });

        if (activeSubMenuParent) {
            activeSubMenuParent.classList.remove('active-parent');
        }

        const path = newParentPath.split(',').filter(Boolean);
        let subData = dadosDoComunicador.navegacao;
        for (const key of path) { subData = subData?.[key]?.sub; }

        if (subData) {
            activeSubMenuParent = parentMenuItem;
            activeSubMenuParent.classList.add('active-parent');
            renderSubMenu(activeSubMenuParent, subData, path);
        } else {
            activeSubMenuParent = null;
        }
    };

    const closeActiveSubMenu = () => {
        if(activeSubMenuParent) {
            activeSubMenuParent.classList.remove('active-parent');
            document.querySelectorAll('.submenu-item').forEach(el => el.remove());
            activeSubMenuParent = null;
        }
    }

    const onDragEnd = () => {
        clearTimeout(submenuCloseTimeoutId);
        if (dropTarget) {
            const key = dropTarget.dataset.key;
            const path = dropTarget.dataset.path;
            if (key && key !== '__cancel__') {
                if (key === '__voltar__') {
                    caminhoNavegacao.pop();
                } else if (path) {
                    funcs.setNavegacao(path.split(',').filter(Boolean));
                }
                atualizarInterfaceCompleta();
            }
        }
        fecharMenu();
        if (draggedIcon) document.body.removeChild(draggedIcon);
        draggedIcon = null;
        dropTarget = null;
        activeSubMenuParent = null;
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchend', onDragEnd);
    };

    triggerBtn.addEventListener('mousedown', onDragStart);
    triggerBtn.addEventListener('touchstart', onDragStart);
}

function moveDraggedIcon(x, y) {
    if (draggedIcon) {
        draggedIcon.style.left = `${x}px`;
        draggedIcon.style.top = `${y}px`;
    }
}

function criarMenuItem({ className, key, path, html, center, transform }) {
    const { DOM } = scope;
    const element = document.createElement('div');
    element.className = className;
    if (key) element.dataset.key = key;
    if (path) element.dataset.path = path;
    element.style.left = `${center.x}px`;
    element.style.top = `${center.y}px`;
    element.style.setProperty('--pos-transform', transform);
    element.innerHTML = html;
    DOM.menuOverlay.appendChild(element);
    return element;
};

function abrirMenuRadial(triggerRect) {
    const { DOM, dadosDoComunicador, caminhoNavegacao } = scope;
    DOM.menuOverlay.innerHTML = '';
    DOM.menuOverlay.classList.add('visible');
    const centerX = triggerRect.left + triggerRect.width / 2;
    const centerY = triggerRect.top + triggerRect.height / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 3.8;

    criarMenuItem({
        className: 'menu-cancel-btn', key: '__cancel__', path: '__cancel__',
        html: '❌', center: { x: centerX, y: centerY }, transform: 'scale(1)'
    });

    if (caminhoNavegacao.length > 0) {
         criarMenuItem({
            className: 'menu-option', key: '__voltar__', path: '__voltar__',
            html: `⬅️ <span class="menu-text">Voltar</span>`, center: { x: centerX, y: centerY },
            transform: `translateY(-${radius}px)`
        });
    }

    const data = dadosDoComunicador.navegacao;
    const optionKeys = Object.keys(data);
    const totalItems = optionKeys.length;
    const angleRange = 160;
    const startAngle = 90 - (angleRange / 2);
    const angleStep = totalItems > 1 ? angleRange / (totalItems - 1) : 0;

    optionKeys.forEach((key, index) => {
        const item = data[key];
        const angle = startAngle + (angleStep * index);
        const translateX = radius * Math.cos(angle * Math.PI / 180);
        const translateY = radius * Math.sin(angle * Math.PI / 180);
        criarMenuItem({
            className: 'menu-option', key: key, path: key,
            html: `${item.emoji || '📁'} <span class="menu-text">${key}</span>`,
            center: { x: centerX, y: centerY },
            transform: `translateX(${translateX}px) translateY(${translateY}px)`
        });
    });
}

function renderSubMenu(parentElement, subData, parentPath) {
    const { DOM } = scope;
    const parentRect = parentElement.getBoundingClientRect();
    const mainButtonRect = DOM.btnNavegar.getBoundingClientRect();
    const mainCenterX = mainButtonRect.left + mainButtonRect.width / 2;
    const mainCenterY = mainButtonRect.top + mainButtonRect.height / 2;
    const parentCenterX = parentRect.left + parentRect.width / 2;
    const parentCenterY = parentRect.top + parentRect.height / 2;
    const parentAngle = Math.atan2(parentCenterY - mainCenterY, parentCenterX - mainCenterX) * 180 / Math.PI;
    const radius = parentRect.width * 1.5;
    const optionKeys = Object.keys(subData);
    const totalItems = optionKeys.length;
    const angleRange = 120;
    const startAngle = parentAngle - (angleRange / 2);
    const angleStep = totalItems > 1 ? angleRange / (totalItems - 1) : 0;
    optionKeys.forEach((key, index) => {
        const item = subData[key];
        const angle = startAngle + (angleStep * index);
        const translateX = radius * Math.cos(angle * Math.PI / 180);
        const translateY = radius * Math.sin(angle * Math.PI / 180);
        criarMenuItem({
            className: 'menu-option submenu-item', key: key, path: [...parentPath, key].join(','),
            html: `${item.emoji || '📁'} <span class="menu-text">${key}</span>`,
            center: { x: parentCenterX, y: parentCenterY },
            transform: `translateX(${translateX}px) translateY(${translateY}px)`
        });
    });
}

function fecharMenu() {
    const { DOM } = scope;
    clearTimeout(submenuCloseTimeoutId);
    submenuCloseTimeoutId = null;
    DOM.menuOverlay.classList.remove('visible');
    document.querySelectorAll('.submenu-item').forEach(el => el.remove());
    if (activeSubMenuParent) {
        activeSubMenuParent.classList.remove('active-parent');
        activeSubMenuParent = null;
    }
}