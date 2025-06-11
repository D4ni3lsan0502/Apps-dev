// Script para validação e teste de funcionalidades do BarberPro

// Namespace global para o BarberPro
window.BarberPro = window.BarberPro || {};

// Módulo de validação e teste
window.BarberPro.Validator = (function() {
    // Armazenar resultados de testes
    const testResults = {
        navigation: false,
        storage: false,
        integration: false,
        agendamento: false,
        login: false
    };
    
    // Função para testar navegação
    function testNavigation() {
        console.log('Testando módulo de navegação...');
        
        // Verificar se o módulo de navegação está disponível
        if (!window.BarberPro.Navigation) {
            console.error('Módulo de navegação não encontrado');
            return false;
        }
        
        // Verificar se as funções essenciais existem
        const nav = window.BarberPro.Navigation;
        const hasRequiredFunctions = 
            typeof nav.navigateTo === 'function' && 
            typeof nav.getUrlParams === 'function' && 
            typeof nav.pages === 'object';
            
        if (!hasRequiredFunctions) {
            console.error('Funções essenciais de navegação não encontradas');
            return false;
        }
        
        console.log('✓ Módulo de navegação validado com sucesso');
        testResults.navigation = true;
        return true;
    }
    
    // Função para testar armazenamento
    function testStorage() {
        console.log('Testando módulo de armazenamento...');
        
        // Verificar se o localStorage está disponível
        if (typeof localStorage === 'undefined') {
            console.error('localStorage não está disponível neste navegador');
            return false;
        }
        
        // Testar operações básicas de armazenamento
        try {
            // Salvar um item de teste
            localStorage.setItem('barberpro_test', JSON.stringify({test: 'ok', timestamp: Date.now()}));
            
            // Recuperar o item
            const testItem = JSON.parse(localStorage.getItem('barberpro_test'));
            
            // Verificar se o item foi recuperado corretamente
            if (!testItem || testItem.test !== 'ok') {
                console.error('Falha ao recuperar item de teste do localStorage');
                return false;
            }
            
            // Limpar o item de teste
            localStorage.removeItem('barberpro_test');
            
            console.log('✓ Operações de armazenamento validadas com sucesso');
            testResults.storage = true;
            return true;
        } catch (error) {
            console.error('Erro ao testar operações de armazenamento:', error);
            return false;
        }
    }
    
    // Função para testar integração
    function testIntegration() {
        console.log('Testando integração entre módulos...');
        
        // Verificar se os módulos essenciais estão disponíveis
        const hasNavigation = !!window.BarberPro.Navigation;
        const hasIntegration = !!window.BarberPro.Integration;
        
        if (!hasNavigation || !hasIntegration) {
            console.error('Módulos essenciais não encontrados');
            return false;
        }
        
        // Verificar se os scripts necessários foram carregados
        const scripts = document.querySelectorAll('script');
        const scriptSources = Array.from(scripts).map(script => script.src);
        
        const requiredScripts = [
            'navigation.js',
            'page-integration.js'
        ];
        
        const missingScripts = requiredScripts.filter(required => 
            !scriptSources.some(src => src.includes(required))
        );
        
        if (missingScripts.length > 0) {
            console.error('Scripts necessários não carregados:', missingScripts);
            return false;
        }
        
        console.log('✓ Integração entre módulos validada com sucesso');
        testResults.integration = true;
        return true;
    }
    
    // Função para testar funcionalidade de agendamento
    function testAgendamento() {
        console.log('Testando funcionalidade de agendamento...');
        
        // Verificar se estamos na página de agendamento
        const isAgendamentoPage = window.location.pathname.includes('agendamento.html');
        
        if (!isAgendamentoPage) {
            console.log('Não estamos na página de agendamento, pulando teste');
            return null;
        }
        
        // Verificar elementos essenciais da página
        const servicosContainer = document.querySelector('.servicos-container');
        const calendarioContainer = document.querySelector('.calendario-container');
        const formAgendamento = document.getElementById('form-agendamento');
        
        if (!servicosContainer || !calendarioContainer || !formAgendamento) {
            console.error('Elementos essenciais da página de agendamento não encontrados');
            return false;
        }
        
        // Verificar se há serviços disponíveis
        const servicosCards = servicosContainer.querySelectorAll('.service-card');
        if (!servicosCards.length) {
            console.error('Nenhum serviço disponível na página');
            return false;
        }
        
        // Verificar se há controles de quantidade
        const quantityControls = servicosContainer.querySelectorAll('.quantity-control');
        if (!quantityControls.length) {
            console.error('Controles de quantidade não encontrados');
            return false;
        }
        
        console.log('✓ Funcionalidade de agendamento validada com sucesso');
        testResults.agendamento = true;
        return true;
    }
    
    // Função para testar login
    function testLogin() {
        console.log('Testando funcionalidade de login...');
        
        // Verificar se estamos na página de login
        const isLoginPage = 
            window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('index.html');
        
        if (!isLoginPage) {
            console.log('Não estamos na página de login, pulando teste');
            return null;
        }
        
        // Verificar elementos essenciais da página
        const loginForm = 
            document.getElementById('login-form') || 
            document.getElementById('login-cliente-form') || 
            document.getElementById('login-barbeiro-form');
        
        if (!loginForm) {
            console.error('Formulário de login não encontrado');
            return false;
        }
        
        // Verificar campos de email e senha
        const emailField = 
            document.getElementById('email') || 
            document.getElementById('email-cliente') || 
            document.getElementById('email-barbeiro');
            
        const passwordField = 
            document.getElementById('password') || 
            document.getElementById('senha-cliente') || 
            document.getElementById('senha-barbeiro');
        
        if (!emailField || !passwordField) {
            console.error('Campos de email ou senha não encontrados');
            return false;
        }
        
        console.log('✓ Funcionalidade de login validada com sucesso');
        testResults.login = true;
        return true;
    }
    
    // Função para executar todos os testes
    function runAllTests() {
        console.log('Iniciando validação completa do BarberPro...');
        
        // Executar testes
        testNavigation();
        testStorage();
        testIntegration();
        testAgendamento();
        testLogin();
        
        // Exibir resultados
        console.log('Resultados da validação:');
        for (const [test, result] of Object.entries(testResults)) {
            console.log(`${result ? '✓' : '✗'} ${test}: ${result ? 'Sucesso' : 'Falha'}`);
        }
        
        // Verificar se todos os testes passaram
        const allPassed = Object.values(testResults).every(result => result === true || result === null);
        
        if (allPassed) {
            console.log('✅ Todos os testes foram bem-sucedidos!');
            return true;
        } else {
            console.error('❌ Alguns testes falharam. Verifique os logs para mais detalhes.');
            return false;
        }
    }
    
    // Função para exibir resultados na interface
    function showTestResults() {
        // Criar elemento para exibir resultados
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md';
        resultsContainer.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-bold text-lg">Resultados da Validação</h3>
                <button id="close-results" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-2">
                ${Object.entries(testResults).map(([test, result]) => `
                    <div class="flex items-center">
                        <span class="w-6 h-6 flex items-center justify-center rounded-full ${result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${result ? '✓' : '✗'}
                        </span>
                        <span class="ml-2 capitalize">${test}</span>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 pt-2 border-t border-gray-200">
                <p class="text-sm ${Object.values(testResults).every(r => r === true || r === null) ? 'text-green-600' : 'text-red-600'}">
                    ${Object.values(testResults).every(r => r === true || r === null) 
                        ? '✅ Todos os testes foram bem-sucedidos!' 
                        : '❌ Alguns testes falharam. Verifique o console para mais detalhes.'}
                </p>
            </div>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(resultsContainer);
        
        // Configurar botão de fechar
        document.getElementById('close-results').addEventListener('click', () => {
            resultsContainer.remove();
        });
    }
    
    // Função para inicializar o módulo
    function init() {
        // Verificar se estamos em um navegador
        if (typeof window === 'undefined') return;
        
        // Adicionar botão de validação
        const validationButton = document.createElement('button');
        validationButton.className = 'fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center';
        validationButton.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            Validar App
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(validationButton);
        
        // Configurar evento de clique
        validationButton.addEventListener('click', () => {
            runAllTests();
            showTestResults();
        });
        
        console.log('BarberPro Validator: Módulo inicializado');
    }
    
    // API pública
    return {
        init: init,
        runAllTests: runAllTests,
        testResults: testResults
    };
})();

// Inicializar automaticamente
window.BarberPro.Validator.init();
