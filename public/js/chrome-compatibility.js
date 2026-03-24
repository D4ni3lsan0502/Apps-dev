// Script para garantir compatibilidade com Chrome e outros navegadores

// Detectar navegador
function detectBrowser() {
  const userAgent = navigator.userAgent;
  let browserName;
  
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "edge";
  } else {
    browserName = "unknown";
  }
  
  return browserName;
}

// Verificar se o DOM está completamente carregado
function isDOMLoaded() {
  return document.readyState === 'complete' || document.readyState === 'interactive';
}

// Inicializar componentes de forma segura
function safeInitialize(callback) {
  if (isDOMLoaded()) {
    setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error('Erro ao inicializar componente:', error);
      }
    }, 100);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        try {
          callback();
        } catch (error) {
          console.error('Erro ao inicializar componente:', error);
        }
      }, 100);
    });
  }
}

// Garantir que o localStorage está disponível
function isLocalStorageAvailable() {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Inicializar BarberPro de forma segura
function initializeBarberPro() {
  // Detectar navegador
  const browser = detectBrowser();
  console.log('Navegador detectado:', browser);
  
  // Adicionar classe ao body para estilos específicos por navegador
  document.body.classList.add(`browser-${browser}`);
  
  // Verificar localStorage
  if (!isLocalStorageAvailable()) {
    console.error('LocalStorage não disponível. Algumas funcionalidades podem não funcionar corretamente.');
    
    // Mostrar alerta ao usuário
    const alertElement = document.createElement('div');
    alertElement.className = 'p-4 bg-red-100 border border-red-400 text-red-700 rounded fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg';
    alertElement.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm">Armazenamento local não disponível. Algumas funcionalidades podem não funcionar corretamente.</p>
        </div>
        <div class="ml-auto pl-3">
          <button class="inline-flex text-red-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(alertElement);
    
    // Configurar botão de fechar
    const closeButton = alertElement.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        alertElement.remove();
      });
    }
    
    // Auto-remover após 10 segundos
    setTimeout(() => {
      if (document.body.contains(alertElement)) {
        alertElement.remove();
      }
    }, 10000);
  }
  
  // Inicializar namespace global se não existir
  window.BarberPro = window.BarberPro || {};
  
  // Registrar Service Worker com tratamento especial para Chrome
  if ('serviceWorker' in navigator) {
    // No Chrome, atrasar o registro do Service Worker para garantir que a página carregue primeiro
    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
        })
        .catch(error => {
          console.error('Falha ao registrar o Service Worker:', error);
        });
    };
    
    if (browser === 'chrome') {
      // No Chrome, esperar a página carregar completamente
      window.addEventListener('load', () => {
        setTimeout(registerServiceWorker, 1000);
      });
    } else {
      // Em outros navegadores, registrar normalmente
      window.addEventListener('load', registerServiceWorker);
    }
  }
  
  // Verificar se os scripts necessários foram carregados
  function checkScriptsLoaded() {
    const requiredComponents = [
      { name: 'AgendamentoStorage', path: 'js/agendamento-storage.js' },
      { name: 'ItemQuantidadeManager', path: 'js/agendamento-storage.js' }
    ];
    
    const missingComponents = requiredComponents.filter(component => 
      !window.BarberPro || !window.BarberPro[component.name]
    );
    
    if (missingComponents.length > 0) {
      console.warn('Componentes necessários não encontrados:', missingComponents.map(c => c.name));
      
      // Tentar carregar os scripts faltantes
      missingComponents.forEach(component => {
        const script = document.createElement('script');
        script.src = component.path;
        script.async = false; // Garantir que os scripts sejam carregados em ordem
        document.body.appendChild(script);
      });
      
      // Verificar novamente após um tempo
      setTimeout(checkScriptsLoaded, 1000);
    } else {
      console.log('Todos os componentes necessários foram carregados');
    }
  }
  
  // Verificar scripts após um tempo para garantir que a página tenha carregado
  setTimeout(checkScriptsLoaded, 500);
}

// Inicializar quando o documento estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBarberPro);
} else {
  initializeBarberPro();
}

// Exportar funções úteis
window.ChromeCompatibility = {
  detectBrowser,
  safeInitialize,
  isLocalStorageAvailable
};
