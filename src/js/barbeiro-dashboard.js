// Script para gerenciar o dashboard do barbeiro
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    inicializarDashboard();
    carregarAgendamentos();
    configurarEventListeners();
    atualizarDataAtual();
});

// Função para inicializar o dashboard
function inicializarDashboard() {
    // Verificar se o usuário está logado como barbeiro
    const usuarioAtual = obterUsuarioLogado();
    if (!usuarioAtual || usuarioAtual.tipo !== 'barbeiro') {
        // Redirecionar para login se não estiver logado como barbeiro
        window.location.href = 'login.html';
        return;
    }
    
    // Atualizar informações do barbeiro no dashboard
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

// Função para atualizar informações do barbeiro no dashboard
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
}

// Função para carregar agendamentos do barbeiro
function carregarAgendamentos() {
    const usuarioAtual = obterUsuarioLogado();
    if (!usuarioAtual || !usuarioAtual.id) return;
    
    // Usar o AgendamentoStorage para buscar agendamentos do barbeiro logado
    const agendamentos = window.BarberPro.AgendamentoStorage.getByBarbeiro(usuarioAtual.id);
    
    // Atualizar estatísticas
    atualizarEstatisticas(agendamentos);
    
    // Renderizar tabela de próximos agendamentos
    renderizarTabelaAgendamentos(agendamentos);
}

// Função para atualizar estatísticas do dashboard
function atualizarEstatisticas(agendamentos) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Filtrar agendamentos de hoje
    const agendamentosHoje = agendamentos.filter(agendamento => {
        const dataAgendamento = new Date(agendamento.data);
        dataAgendamento.setHours(0, 0, 0, 0);
        return dataAgendamento.getTime() === hoje.getTime();
    });
    
    // Calcular faturamento de hoje
    const faturamentoHoje = agendamentosHoje.reduce((total, agendamento) => {
        return total + (agendamento.valorTotal || 0);
    }, 0);
    
    // Contar clientes atendidos (agendamentos concluídos)
    const clientesAtendidos = agendamentos.filter(agendamento => 
        agendamento.status === 'concluido'
    ).length;
    
    // Calcular avaliação média
    let avaliacaoMedia = 4.8; // Valor padrão
    const avaliacoes = agendamentos
        .filter(agendamento => agendamento.avaliacao)
        .map(agendamento => agendamento.avaliacao);
    
    if (avaliacoes.length > 0) {
        avaliacaoMedia = avaliacoes.reduce((soma, avaliacao) => soma + avaliacao, 0) / avaliacoes.length;
        avaliacaoMedia = Math.round(avaliacaoMedia * 10) / 10; // Arredondar para 1 casa decimal
    }
    
    // Atualizar elementos na interface
    document.querySelector('.agendamentos-hoje').textContent = agendamentosHoje.length;
    document.querySelector('.faturamento-hoje').textContent = `R$ ${faturamentoHoje.toFixed(2).replace('.', ',')}`;
    document.querySelector('.clientes-atendidos').textContent = clientesAtendidos;
    document.querySelector('.avaliacao-media').textContent = avaliacaoMedia;
}

// Função para renderizar tabela de agendamentos
function renderizarTabelaAgendamentos(agendamentos) {
    const tabelaBody = document.querySelector('.tabela-agendamentos tbody');
    if (!tabelaBody) return;
    
    // Limpar tabela
    tabelaBody.innerHTML = '';
    
    // Filtrar apenas agendamentos pendentes e confirmados
    const agendamentosFuturos = agendamentos.filter(agendamento => 
        agendamento.status === 'pendente' || agendamento.status === 'confirmado'
    );
    
    // Ordenar por data/horário
    agendamentosFuturos.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.horario}`);
        const dataB = new Date(`${b.data}T${b.horario}`);
        return dataA - dataB;
    });
    
    // Limitar aos próximos 5 agendamentos
    const proximosAgendamentos = agendamentosFuturos.slice(0, 5);
    
    if (proximosAgendamentos.length === 0) {
        // Exibir mensagem se não houver agendamentos
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Nenhum agendamento encontrado.
            </td>
        `;
        tabelaBody.appendChild(tr);
        return;
    }
    
    // Renderizar cada agendamento
    proximosAgendamentos.forEach(agendamento => {
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
                <span class="${statusClass}">${agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 btn-confirmar" data-id="${agendamento.id}">
                    <i class="fas fa-check"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 btn-cancelar" data-id="${agendamento.id}">
                    <i class="fas fa-times"></i>
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
    
    // Botão "Ver todos os agendamentos"
    const btnVerTodos = document.querySelector('.btn-ver-todos');
    if (btnVerTodos) {
        btnVerTodos.addEventListener('click', function() {
            window.location.href = 'agendamentos.html';
        });
    }
}

// Função para atualizar a data atual
function atualizarDataAtual() {
    const elementoData = document.getElementById('current-date');
    if (elementoData) {
        const hoje = new Date();
        const opcoes = { day: 'numeric', month: 'long', year: 'numeric' };
        elementoData.textContent = hoje.toLocaleDateString('pt-BR', opcoes);
    }
}

// Exportar para uso global
window.BarberPro = window.BarberPro || {};
window.BarberPro.DashboardBarbeiro = {
    inicializar: inicializarDashboard,
    carregarAgendamentos: carregarAgendamentos
};
