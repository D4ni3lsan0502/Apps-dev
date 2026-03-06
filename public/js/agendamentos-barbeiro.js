// Script para visualização completa de agendamentos do barbeiro
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    inicializarPagina();
    carregarAgendamentos();
    configurarEventListeners();
});

// Função para inicializar a página
function inicializarPagina() {
    // Verificar se o usuário está logado como barbeiro
    const usuarioAtual = obterUsuarioLogado();
    if (!usuarioAtual || usuarioAtual.tipo !== 'barbeiro') {
        // Redirecionar para login se não estiver logado como barbeiro
        window.location.href = 'login.html';
        return;
    }
    
    // Atualizar informações do barbeiro na página
    atualizarInfoBarbeiro(usuarioAtual);
}

// Função para obter o usuário logado do localStorage
function obterUsuarioLogado() {
    try {
        const usuarioJSON = localStorage.getItem('barberpro_usuario_logado');
        return usuarioJSON ? JSON.parse(usuarioJSON) : null;
    } catch (e) {
        console.error('Erro ao recuperar usuário logado:', e);
        return null;
    }
}

// Função para atualizar informações do barbeiro na página
function atualizarInfoBarbeiro(barbeiro) {
    // Atualizar nome e foto do barbeiro no sidebar e menu mobile
    const elementosNomeBarbeiro = document.querySelectorAll('.nome-barbeiro');
    const elementosFotoBarbeiro = document.querySelectorAll('.foto-barbeiro');
    
    elementosNomeBarbeiro.forEach(elemento => {
        if (elemento) elemento.textContent = barbeiro.nome || 'Barbeiro';
    });
    
    elementosFotoBarbeiro.forEach(elemento => {
        if (elemento) elemento.src = barbeiro.foto || 'https://randomuser.me/api/portraits/men/32.jpg';
    });
    
    // Atualizar título da página
    const elementoTitulo = document.querySelector('.titulo-pagina');
    if (elementoTitulo) {
        elementoTitulo.textContent = `Agendamentos - ${barbeiro.nome}`;
    }
}

// Função para carregar agendamentos do barbeiro
function carregarAgendamentos() {
    const usuarioAtual = obterUsuarioLogado();
    if (!usuarioAtual || !usuarioAtual.id) return;
    
    // Usar o AgendamentoStorage para buscar agendamentos do barbeiro logado
    const agendamentos = window.BarberPro.AgendamentoStorage.getByBarbeiro(usuarioAtual.id);
    
    // Renderizar tabela de agendamentos
    renderizarTabelaAgendamentos(agendamentos);
}

// Função para renderizar tabela de agendamentos
function renderizarTabelaAgendamentos(agendamentos) {
    const tabelaBody = document.querySelector('.tabela-agendamentos tbody');
    if (!tabelaBody) return;
    
    // Limpar tabela
    tabelaBody.innerHTML = '';
    
    // Ordenar por data/horário
    agendamentos.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.horario}`);
        const dataB = new Date(`${b.data}T${b.horario}`);
        return dataA - dataB;
    });
    
    if (agendamentos.length === 0) {
        // Exibir mensagem se não houver agendamentos
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                Nenhum agendamento encontrado.
            </td>
        `;
        tabelaBody.appendChild(tr);
        return;
    }
    
    // Renderizar cada agendamento
    agendamentos.forEach(agendamento => {
        const tr = document.createElement('tr');
        
        // Formatar data e horário para exibição
        const dataObj = new Date(agendamento.data);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataObj.setHours(0, 0, 0, 0);
        
        let dataExibicao = '';
        if (dataObj.getTime() === hoje.getTime()) {
            dataExibicao = 'Hoje';
        } else if (dataObj.getTime() === hoje.getTime() + 86400000) {
            dataExibicao = 'Amanhã';
        } else {
            dataExibicao = dataObj.toLocaleDateString('pt-BR');
        }
        
        // Buscar informações do cliente
        const cliente = buscarCliente(agendamento.clienteId);
        
        // Determinar serviços
        let servicoNome = 'Serviço não especificado';
        let servicoDuracao = '';
        
        if (agendamento.servicos && agendamento.servicos.length > 0) {
            servicoNome = agendamento.servicos.map(s => s.nome).join(' + ');
            servicoDuracao = `${agendamento.duracaoTotal || 30} min`;
        }
        
        // Determinar classe de status
        let statusClass = '';
        switch (agendamento.status) {
            case 'confirmado':
                statusClass = 'status-badge confirmed';
                break;
            case 'pendente':
                statusClass = 'status-badge pending';
                break;
            case 'concluido':
                statusClass = 'status-badge completed';
                break;
            case 'cancelado':
                statusClass = 'status-badge canceled';
                break;
            default:
                statusClass = 'status-badge pending';
        }
        
        // Formatar valor para exibição
        const valorFormatado = agendamento.valorTotal ? 
            `R$ ${agendamento.valorTotal.toFixed(2).replace('.', ',')}` : 
            'R$ 0,00';
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full" src="${cliente.foto || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${cliente.nome || 'Cliente'}</div>
                        <div class="text-sm text-gray-500">${cliente.telefone || ''}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${servicoNome}</div>
                <div class="text-sm text-gray-500">${servicoDuracao}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${dataExibicao}, ${agendamento.horario}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${agendamento.local || 'Barbearia'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${valorFormatado}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusClass}">${agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                ${agendamento.status === 'pendente' ? `
                    <button class="text-blue-600 hover:text-blue-900 mr-3 btn-confirmar" data-id="${agendamento.id}">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                ${agendamento.status !== 'cancelado' && agendamento.status !== 'concluido' ? `
                    <button class="text-red-600 hover:text-red-900 mr-3 btn-cancelar" data-id="${agendamento.id}">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                <button class="text-gray-600 hover:text-gray-900 btn-detalhes" data-id="${agendamento.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tabelaBody.appendChild(tr);
    });
    
    // Adicionar event listeners para os botões de ação
    adicionarEventListenersAcoes();
}

// Função para buscar informações do cliente
function buscarCliente(clienteId) {
    try {
        const clientesJSON = localStorage.getItem('barberpro_clientes');
        const clientes = clientesJSON ? JSON.parse(clientesJSON) : [];
        return clientes.find(c => c.id === clienteId) || {};
    } catch (e) {
        console.error('Erro ao buscar cliente:', e);
        return {};
    }
}

// Função para adicionar event listeners aos botões de ação
function adicionarEventListenersAcoes() {
    // Botões de confirmar agendamento
    document.querySelectorAll('.btn-confirmar').forEach(btn => {
        btn.addEventListener('click', function() {
            const agendamentoId = this.getAttribute('data-id');
            confirmarAgendamento(agendamentoId);
        });
    });
    
    // Botões de cancelar agendamento
    document.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', function() {
            const agendamentoId = this.getAttribute('data-id');
            cancelarAgendamento(agendamentoId);
        });
    });
    
    // Botões de detalhes do agendamento
    document.querySelectorAll('.btn-detalhes').forEach(btn => {
        btn.addEventListener('click', function() {
            const agendamentoId = this.getAttribute('data-id');
            mostrarDetalhesAgendamento(agendamentoId);
        });
    });
}

// Função para confirmar agendamento
function confirmarAgendamento(agendamentoId) {
    if (!agendamentoId) return;
    
    // Atualizar status do agendamento
    const atualizado = window.BarberPro.AgendamentoStorage.update(agendamentoId, {
        status: 'confirmado'
    });
    
    if (atualizado) {
        // Recarregar agendamentos
        carregarAgendamentos();
        
        // Exibir notificação
        exibirNotificacao('Agendamento confirmado com sucesso!', 'success');
    } else {
        exibirNotificacao('Erro ao confirmar agendamento.', 'error');
    }
}

// Função para cancelar agendamento
function cancelarAgendamento(agendamentoId) {
    if (!agendamentoId) return;
    
    // Confirmar cancelamento
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    // Atualizar status do agendamento
    const atualizado = window.BarberPro.AgendamentoStorage.update(agendamentoId, {
        status: 'cancelado'
    });
    
    if (atualizado) {
        // Recarregar agendamentos
        carregarAgendamentos();
        
        // Exibir notificação
        exibirNotificacao('Agendamento cancelado com sucesso!', 'success');
    } else {
        exibirNotificacao('Erro ao cancelar agendamento.', 'error');
    }
}

// Função para mostrar detalhes do agendamento
function mostrarDetalhesAgendamento(agendamentoId) {
    if (!agendamentoId) return;
    
    // Buscar agendamento
    const agendamentos = window.BarberPro.AgendamentoStorage.getAll();
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    
    if (!agendamento) {
        exibirNotificacao('Agendamento não encontrado.', 'error');
        return;
    }
    
    // Buscar cliente
    const cliente = buscarCliente(agendamento.clienteId);
    
    // Criar modal de detalhes
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center';
    
    // Formatar data para exibição
    const dataObj = new Date(agendamento.data);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
    
    // Formatar serviços
    let servicosHTML = '<p class="text-gray-500">Nenhum serviço selecionado</p>';
    if (agendamento.servicos && agendamento.servicos.length > 0) {
        servicosHTML = agendamento.servicos.map(servico => `
            <div class="flex justify-between items-center mb-2">
                <span>${servico.nome}</span>
                <span>R$ ${servico.preco.toFixed(2).replace('.', ',')}</span>
            </div>
        `).join('');
    }
    
    // Determinar classe de status
    let statusClass = '';
    switch (agendamento.status) {
        case 'confirmado':
            statusClass = 'bg-green-100 text-green-800';
            break;
        case 'pendente':
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
        case 'concluido':
            statusClass = 'bg-blue-100 text-blue-800';
            break;
        case 'cancelado':
            statusClass = 'bg-red-100 text-red-800';
            break;
        default:
            statusClass = 'bg-gray-100 text-gray-800';
    }
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-lg font-semibold text-gray-900">Detalhes do Agendamento</h3>
                <button class="text-gray-400 hover:text-gray-500 focus:outline-none" id="fechar-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">
                <div class="mb-6">
                    <div class="flex items-center mb-4">
                        <img src="${cliente.foto || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="Cliente" class="w-12 h-12 rounded-full mr-4">
                        <div>
                            <h4 class="font-medium text-gray-900">${cliente.nome || 'Cliente'}</h4>
                            <p class="text-sm text-gray-500">${cliente.telefone || ''}</p>
                        </div>
                    </div>
                    <div class="inline-block px-3 py-1 rounded-full ${statusClass} text-sm font-semibold mb-4">
                        ${agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p class="text-sm text-gray-500">Data</p>
                        <p class="font-medium">${dataFormatada}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Horário</p>
                        <p class="font-medium">${agendamento.horario}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Local</p>
                        <p class="font-medium">${agendamento.local || 'Barbearia'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Duração</p>
                        <p class="font-medium">${agendamento.duracaoTotal || 30} min</p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-medium text-gray-900 mb-2">Serviços</h4>
                    <div class="bg-gray-50 p-3 rounded">
                        ${servicosHTML}
                        <div class="border-t mt-2 pt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span>R$ ${agendamento.valorTotal ? agendamento.valorTotal.toFixed(2).replace('.', ',') : '0,00'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-medium text-gray-900 mb-2">Pagamento</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">Forma</p>
                            <p class="font-medium">${formatarFormaPagamento(agendamento.formaPagamento)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Momento</p>
                            <p class="font-medium">${formatarMomentoPagamento(agendamento.momentoPagamento)}</p>
                        </div>
                    </div>
                </div>
                
                ${agendamento.observacoes ? `
                <div class="mb-6">
                    <h4 class="font-medium text-gray-900 mb-2">Observações</h4>
                    <p class="text-gray-700">${agendamento.observacoes}</p>
                </div>
                ` : ''}
                
                <div class="flex justify-end space-x-3 mt-6">
                    ${agendamento.status === 'pendente' ? `
                        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 btn-confirmar-modal" data-id="${agendamento.id}">
                            Confirmar
                        </button>
                    ` : ''}
                    ${agendamento.status !== 'cancelado' && agendamento.status !== 'concluido' ? `
                        <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 btn-cancelar-modal" data-id="${agendamento.id}">
                            Cancelar
                        </button>
                    ` : ''}
                    ${agendamento.status === 'confirmado' ? `
                        <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 btn-concluir-modal" data-id="${agendamento.id}">
                            Marcar como Concluído
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar event listeners ao modal
    document.getElementById('fechar-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Botão de confirmar no modal
    const btnConfirmarModal = modal.querySelector('.btn-confirmar-modal');
    if (btnConfirmarModal) {
        btnConfirmarModal.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            document.body.removeChild(modal);
            confirmarAgendamento(id);
        });
    }
    
    // Botão de cancelar no modal
    const btnCancelarModal = modal.querySelector('.btn-cancelar-modal');
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            document.body.removeChild(modal);
            cancelarAgendamento(id);
        });
    }
    
    // Botão de concluir no modal
    const btnConcluirModal = modal.querySelector('.btn-concluir-modal');
    if (btnConcluirModal) {
        btnConcluirModal.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            document.body.removeChild(modal);
            concluirAgendamento(id);
        });
    }
}

// Função para concluir agendamento
function concluirAgendamento(agendamentoId) {
    if (!agendamentoId) return;
    
    // Atualizar status do agendamento
    const atualizado = window.BarberPro.AgendamentoStorage.update(agendamentoId, {
        status: 'concluido'
    });
    
    if (atualizado) {
        // Recarregar agendamentos
        carregarAgendamentos();
        
        // Exibir notificação
        exibirNotificacao('Agendamento concluído com sucesso!', 'success');
    } else {
        exibirNotificacao('Erro ao concluir agendamento.', 'error');
    }
}

// Função para formatar forma de pagamento
function formatarFormaPagamento(forma) {
    switch (forma) {
        case 'dinheiro':
            return 'Dinheiro';
        case 'cartaoCredito':
            return 'Cartão de Crédito';
        case 'cartaoDebito':
            return 'Cartão de Débito';
        case 'pix':
            return 'PIX';
        case 'transferencia':
            return 'Transferência';
        default:
            return forma || 'Não especificado';
    }
}

// Função para formatar momento de pagamento
function formatarMomentoPagamento(momento) {
    switch (momento) {
        case 'antecipado50':
            return 'Antecipado (50%)';
        case 'antecipado100':
            return 'Antecipado (100%)';
        case 'noAtendimento':
            return 'No atendimento';
        default:
            return momento || 'Não especificado';
    }
}

// Função para exibir notificação
function exibirNotificacao(mensagem, tipo) {
    // Verificar se o elemento de notificação existe
    let notificacao = document.querySelector('.notificacao');
    
    // Criar elemento se não existir
    if (!notificacao) {
        notificacao = document.createElement('div');
        notificacao.className = 'notificacao fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        document.body.appendChild(notificacao);
    }
    
    // Definir classe com base no tipo
    notificacao.className = notificacao.className.replace(/bg-\w+-\d+/g, '');
    
    if (tipo === 'success') {
        notificacao.classList.add('bg-green-500', 'text-white');
    } else if (tipo === 'error') {
        notificacao.classList.add('bg-red-500', 'text-white');
    } else {
        notificacao.classList.add('bg-blue-500', 'text-white');
    }
    
    // Definir mensagem
    notificacao.textContent = mensagem;
    
    // Mostrar notificação
    setTimeout(() => {
        notificacao.classList.remove('translate-x-full');
    }, 100);
    
    // Ocultar após 3 segundos
    setTimeout(() => {
        notificacao.classList.add('translate-x-full');
    }, 3000);
}

// Função para configurar event listeners
function configurarEventListeners() {
    // Menu mobile
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.remove('-translate-x-full');
        });
    }
    
    if (closeMenuButton && mobileMenu) {
        closeMenuButton.addEventListener('click', function() {
            mobileMenu.classList.add('-translate-x-full');
        });
    }
    
    // Filtros
    const filtroStatus = document.getElementById('filtro-status');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', function() {
            aplicarFiltros();
        });
    }
    
    const filtroData = document.getElementById('filtro-data');
    if (filtroData) {
        filtroData.addEventListener('change', function() {
            aplicarFiltros();
        });
    }
    
    // Botão de voltar
    const btnVoltar = document.querySelector('.btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function() {
            window.location.href = 'barbeiro-dashboard.html';
        });
    }
}

// Função para aplicar filtros
function aplicarFiltros() {
    const filtroStatus = document.getElementById('filtro-status');
    const filtroData = document.getElementById('filtro-data');
    
    const statusSelecionado = filtroStatus ? filtroStatus.value : 'todos';
    const dataSelecionada = filtroData ? filtroData.value : '';
    
    const usuarioAtual = obterUsuarioLogado();
    if (!usuarioAtual || !usuarioAtual.id) return;
    
    // Buscar todos os agendamentos do barbeiro
    let agendamentos = window.BarberPro.AgendamentoStorage.getByBarbeiro(usuarioAtual.id);
    
    // Filtrar por status
    if (statusSelecionado !== 'todos') {
        agendamentos = agendamentos.filter(a => a.status === statusSelecionado);
    }
    
    // Filtrar por data
    if (dataSelecionada) {
        agendamentos = agendamentos.filter(a => a.data === dataSelecionada);
    }
    
    // Renderizar tabela filtrada
    renderizarTabelaAgendamentos(agendamentos);
}

// Exportar para uso global
window.BarberPro = window.BarberPro || {};
window.BarberPro.AgendamentosBarbeiro = {
    inicializar: inicializarPagina,
    carregarAgendamentos: carregarAgendamentos,
    aplicarFiltros: aplicarFiltros
};
