// Script para integrar todas as funcionalidades do BarberPro

// Garantir que o namespace global exista
window.BarberPro = window.BarberPro || {};

// Módulo de integração principal
window.BarberPro.Integration = (function() {
    // Armazenar referências aos módulos
    const modules = {
        navigation: window.BarberPro.Navigation,
        storage: window.BarberPro.AgendamentoStorage,
        ui: window.BarberPro.AgendamentoUI
    };
    
    // Detectar página atual
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        return filename;
    }
    
    // Inicializar funcionalidades específicas por página
    function initPageSpecific() {
        const currentPage = getCurrentPage();
        console.log(`BarberPro Integration: Inicializando página ${currentPage}`);
        
        switch(currentPage) {
            case 'index.html':
            case 'login.html':
                initLoginPage();
                break;
            case 'cliente-dashboard.html':
                initClienteDashboard();
                break;
            case 'barbeiro-dashboard.html':
            case 'barbeiro-dashboard-v2.html':
                initBarbeiroDashboard();
                break;
            case 'agendamento.html':
                initAgendamentoPage();
                break;
            case 'confirmacao-agendamento.html':
                initConfirmacaoPage();
                break;
            case 'favoritos.html':
                initFavoritosPage();
                break;
            default:
                console.log('Página genérica, inicializando componentes padrão');
                initCommonComponents();
        }
    }
    
    // Inicializar página de login
    function initLoginPage() {
        console.log('Inicializando página de login');
        
        // Garantir que os formulários de login redirecionem corretamente
        const loginClienteForm = document.getElementById('login-cliente-form');
        const loginBarbeiroForm = document.getElementById('login-barbeiro-form');
        
        if (loginClienteForm) {
            loginClienteForm.addEventListener('submit', function(e) {
                e.preventDefault();
                modules.navigation.navigateTo('dashboardCliente');
            });
        }
        
        if (loginBarbeiroForm) {
            loginBarbeiroForm.addEventListener('submit', function(e) {
                e.preventDefault();
                modules.navigation.navigateTo('dashboardBarbeiro');
            });
        }
        
        // Formulário de login na página index.html
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('email').value;
                
                if (email.includes('barbeiro')) {
                    modules.navigation.navigateTo('dashboardBarbeiro');
                } else {
                    modules.navigation.navigateTo('dashboardCliente');
                }
            });
        }
        
        // Links de cadastro
        document.querySelectorAll('a[href="cadastro-cliente.html"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                modules.navigation.navigateTo('cadastroCliente');
            });
        });
        
        document.querySelectorAll('a[href="cadastro-barbeiro.html"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                modules.navigation.navigateTo('cadastroBarbeiro');
            });
        });
    }
    
    // Inicializar dashboard do cliente
    function initClienteDashboard() {
        console.log('Inicializando dashboard do cliente');
        
        // Carregar agendamentos do cliente
        if (modules.storage && modules.storage.getAgendamentosCliente) {
            const agendamentos = modules.storage.getAgendamentosCliente();
            console.log('Agendamentos do cliente carregados:', agendamentos);
            
            // Atualizar UI com os agendamentos
            const agendamentosContainer = document.querySelector('.agendamentos-lista');
            if (agendamentosContainer && agendamentos && agendamentos.length > 0) {
                // Implementação da exibição dos agendamentos
                console.log('Exibindo agendamentos na UI');
            }
        }
        
        // Inicializar botões de ação
        document.querySelectorAll('.btn-novo-agendamento').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                modules.navigation.navigateTo('agendamento');
            });
        });
        
        // Inicializar links para favoritos
        document.querySelectorAll('.nav-favoritos').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                modules.navigation.navigateTo('favoritos');
            });
        });
    }
    
    // Inicializar dashboard do barbeiro
    function initBarbeiroDashboard() {
        console.log('Inicializando dashboard do barbeiro');
        
        // Carregar agendamentos do barbeiro
        if (modules.storage && modules.storage.getAgendamentosBarbeiro) {
            const agendamentos = modules.storage.getAgendamentosBarbeiro();
            console.log('Agendamentos do barbeiro carregados:', agendamentos);
            
            // Atualizar UI com os agendamentos
            const agendamentosContainer = document.querySelector('table tbody');
            if (agendamentosContainer) {
                console.log('Exibindo agendamentos na tabela');
                // Implementação da exibição dos agendamentos na tabela
            }
        }
        
        // Inicializar botões de ação para agendamentos
        document.querySelectorAll('.btn-confirmar-agendamento').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const agendamentoId = this.getAttribute('data-id');
                if (modules.storage && modules.storage.confirmarAgendamento) {
                    modules.storage.confirmarAgendamento(agendamentoId);
                    alert('Agendamento confirmado com sucesso!');
                    location.reload();
                }
            });
        });
        
        // Inicializar links para GPS/rotas
        document.querySelectorAll('.btn-gps').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const endereco = this.getAttribute('data-endereco');
                if (endereco) {
                    // Abrir mapa com o endereço
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank');
                }
            });
        });
    }
    
    // Inicializar página de agendamento
    function initAgendamentoPage() {
        console.log('Inicializando página de agendamento');
        
        // Verificar se os módulos necessários estão disponíveis
        if (!modules.ui || !modules.storage) {
            console.error('Módulos necessários não encontrados para a página de agendamento');
            return;
        }
        
        // Inicializar seleção de serviços com controle de quantidade
        const servicosContainer = document.querySelector('.servicos-container');
        if (servicosContainer) {
            // Carregar serviços disponíveis
            const servicos = modules.storage.getServicosDisponiveis ? 
                modules.storage.getServicosDisponiveis() : 
                [
                    { id: 1, nome: 'Corte de Cabelo', preco: 40, tempo: 30 },
                    { id: 2, nome: 'Barba', preco: 30, tempo: 20 },
                    { id: 3, nome: 'Corte + Barba', preco: 60, tempo: 45 },
                    { id: 4, nome: 'Pigmentação', preco: 50, tempo: 40 }
                ];
            
            // Renderizar serviços com controle de quantidade
            modules.ui.renderServicosComQuantidade(servicosContainer, servicos);
        }
        
        // Inicializar seleção de data e hora
        const calendarioContainer = document.querySelector('.calendario-container');
        if (calendarioContainer) {
            modules.ui.renderCalendario(calendarioContainer);
        }
        
        // Inicializar formulário de agendamento
        const formAgendamento = document.getElementById('form-agendamento');
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Coletar dados do formulário
                const servicosSelecionados = modules.ui.getServicosSelecionados();
                const dataHoraSelecionada = modules.ui.getDataHoraSelecionada();
                const localAtendimento = document.querySelector('input[name="local"]:checked')?.value || 'barbearia';
                
                // Validar seleções
                if (servicosSelecionados.length === 0) {
                    alert('Selecione pelo menos um serviço');
                    return;
                }
                
                if (!dataHoraSelecionada) {
                    alert('Selecione uma data e horário');
                    return;
                }
                
                // Calcular tempo total e valor
                let tempoTotal = 0;
                let valorTotal = 0;
                
                servicosSelecionados.forEach(servico => {
                    tempoTotal += servico.tempo * servico.quantidade;
                    valorTotal += servico.preco * servico.quantidade;
                });
                
                // Salvar agendamento
                const agendamento = {
                    id: Date.now().toString(),
                    servicos: servicosSelecionados,
                    dataHora: dataHoraSelecionada,
                    local: localAtendimento,
                    tempoTotal: tempoTotal,
                    valorTotal: valorTotal,
                    status: 'pendente'
                };
                
                modules.storage.salvarAgendamento(agendamento);
                
                // Redirecionar para confirmação
                modules.navigation.navigateTo('confirmacaoAgendamento', { id: agendamento.id });
            });
        }
    }
    
    // Inicializar página de confirmação de agendamento
    function initConfirmacaoPage() {
        console.log('Inicializando página de confirmação');
        
        // Obter ID do agendamento da URL
        const params = modules.navigation.getUrlParams();
        const agendamentoId = params.id;
        
        if (!agendamentoId) {
            console.error('ID de agendamento não encontrado na URL');
            return;
        }
        
        // Carregar dados do agendamento
        const agendamento = modules.storage.getAgendamento ? 
            modules.storage.getAgendamento(agendamentoId) : null;
        
        if (!agendamento) {
            console.error('Agendamento não encontrado:', agendamentoId);
            return;
        }
        
        // Exibir detalhes do agendamento
        const detalhesContainer = document.querySelector('.detalhes-agendamento');
        if (detalhesContainer) {
            modules.ui.renderDetalhesAgendamento(detalhesContainer, agendamento);
        }
        
        // Inicializar upload de comprovante
        const uploadForm = document.getElementById('form-comprovante');
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simular upload bem-sucedido
                alert('Comprovante enviado com sucesso!');
                
                // Atualizar status do agendamento
                if (modules.storage.atualizarStatusAgendamento) {
                    modules.storage.atualizarStatusAgendamento(agendamentoId, 'confirmado');
                }
                
                // Redirecionar para dashboard
                setTimeout(() => {
                    modules.navigation.navigateTo('dashboardCliente');
                }, 1500);
            });
        }
    }
    
    // Inicializar página de favoritos
    function initFavoritosPage() {
        console.log('Inicializando página de favoritos');
        
        // Carregar barbeiros favoritos
        const favoritos = modules.storage.getFavoritos ? 
            modules.storage.getFavoritos() : 
            [
                { id: 1, nome: 'Carlos Silva', avaliacao: 4.8, especialidade: 'Corte Degradê' },
                { id: 2, nome: 'Roberto Almeida', avaliacao: 4.7, especialidade: 'Barba' }
            ];
        
        // Exibir favoritos
        const favoritosContainer = document.querySelector('.favoritos-container');
        if (favoritosContainer && favoritos) {
            // Implementação da exibição dos favoritos
            console.log('Exibindo favoritos na UI');
        }
    }
    
    // Inicializar componentes comuns a todas as páginas
    function initCommonComponents() {
        // Menu mobile
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const closeMenuButton = document.getElementById('close-menu-button');
        
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
        
        // Notificações
        const notificationButtons = document.querySelectorAll('[data-notification]');
        notificationButtons.forEach(button => {
            button.addEventListener('click', function() {
                const message = this.getAttribute('data-notification');
                if (message) {
                    showNotification(message);
                }
            });
        });
    }
    
    // Exibir notificação
    function showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700'}`;
        notification.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button class="inline-flex">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Configurar botão de fechar
        const closeButton = notification.querySelector('button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Função para inicializar o módulo
    function init() {
        // Verificar se estamos em um navegador
        if (typeof window === 'undefined') return;
        
        // Inicializar quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initCommonComponents();
                initPageSpecific();
            });
        } else {
            initCommonComponents();
            initPageSpecific();
        }
        
        console.log('BarberPro Integration: Módulo inicializado');
    }
    
    // API pública
    return {
        init: init,
        showNotification: showNotification
    };
})();

// Inicializar automaticamente
window.BarberPro.Integration.init();
