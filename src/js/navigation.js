// Script para gerenciar navegação e integração entre páginas do BarberPro

// Namespace global para o BarberPro
window.BarberPro = window.BarberPro || {};

// Módulo de navegação
window.BarberPro.Navigation = (function() {
    // Armazenar referências de páginas
    const pages = {
        login: 'login.html',
        cadastroCliente: 'cadastro-cliente.html',
        cadastroBarbeiro: 'cadastro-barbeiro.html',
        dashboardCliente: 'cliente-dashboard.html',
        dashboardBarbeiro: 'barbeiro-dashboard.html',
        dashboardBarbeiroV2: 'barbeiro-dashboard-v2.html',
        agendamento: 'agendamento.html',
        confirmacaoAgendamento: 'confirmacao-agendamento.html',
        favoritos: 'favoritos.html',
        perfilBarbeiro: 'barbeiro-perfil.html'
    };

    // Função para navegar para uma página
    function navigateTo(page, params = {}) {
        if (!pages[page]) {
            console.error(`Página "${page}" não encontrada no sistema de navegação`);
            return false;
        }

        // Construir URL com parâmetros
        let url = pages[page];
        const queryParams = [];
        
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
            }
        }
        
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
        
        // Registrar navegação no histórico de sessão
        try {
            const navigationHistory = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
            navigationHistory.push({
                from: window.location.pathname,
                to: url,
                timestamp: new Date().toISOString()
            });
            sessionStorage.setItem('navigationHistory', JSON.stringify(navigationHistory));
        } catch (e) {
            console.warn('Não foi possível registrar histórico de navegação:', e);
        }
        
        // Navegar para a página
        window.location.href = url;
        return true;
    }
    
    // Função para voltar à página anterior
    function goBack() {
        window.history.back();
    }
    
    // Função para extrair parâmetros da URL atual
    function getUrlParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');
        
        for (let i = 0; i < pairs.length; i++) {
            if (!pairs[i]) continue;
            
            const pair = pairs[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        
        return params;
    }
    
    // Inicializar links de navegação na página atual
    function initializeNavLinks() {
        // Mapear links de navegação comuns
        const navMappings = [
            { selector: '.nav-to-login, .btn-logout', page: 'login' },
            { selector: '.nav-to-dashboard-cliente', page: 'dashboardCliente' },
            { selector: '.nav-to-dashboard-barbeiro', page: 'dashboardBarbeiro' },
            { selector: '.nav-to-dashboard-barbeiro-v2', page: 'dashboardBarbeiroV2' },
            { selector: '.nav-to-agendamento', page: 'agendamento' },
            { selector: '.nav-to-confirmacao', page: 'confirmacaoAgendamento' },
            { selector: '.nav-to-favoritos', page: 'favoritos' },
            { selector: '.nav-to-perfil-barbeiro', page: 'perfilBarbeiro' },
            { selector: '.nav-to-cadastro-cliente', page: 'cadastroCliente' },
            { selector: '.nav-to-cadastro-barbeiro', page: 'cadastroBarbeiro' }
        ];
        
        // Adicionar event listeners para cada mapeamento
        navMappings.forEach(mapping => {
            document.querySelectorAll(mapping.selector).forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Verificar se há atributos data-param-* para passar como parâmetros
                    const params = {};
                    for (const attr of this.attributes) {
                        if (attr.name.startsWith('data-param-')) {
                            const paramName = attr.name.substring(11); // Remover 'data-param-'
                            params[paramName] = attr.value;
                        }
                    }
                    
                    navigateTo(mapping.page, params);
                });
            });
        });
        
        // Inicializar botões de voltar
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                goBack();
            });
        });
    }
    
    // Função para inicializar o módulo
    function init() {
        // Verificar se estamos em um navegador
        if (typeof window === 'undefined') return;
        
        // Inicializar links de navegação quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeNavLinks);
        } else {
            initializeNavLinks();
        }
        
        console.log('BarberPro Navigation: Módulo inicializado');
    }
    
    // API pública
    return {
        init: init,
        navigateTo: navigateTo,
        goBack: goBack,
        getUrlParams: getUrlParams,
        pages: pages
    };
})();

// Inicializar automaticamente
window.BarberPro.Navigation.init();
