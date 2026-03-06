// Funções para geração de links de GPS e rotas

/**
 * Gera um link para abrir o Google Maps com uma rota para o endereço especificado
 * 
 * @param {Object} endereco - Objeto contendo os dados do endereço
 * @param {boolean} usarLocalizacaoAtual - Se deve usar a localização atual como ponto de partida
 * @returns {string} - URL para o Google Maps com a rota
 */
function gerarLinkGoogleMaps(endereco, usarLocalizacaoAtual = true) {
    // Formatar o endereço completo
    const enderecoCompleto = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}`;
    
    // Codificar o endereço para URL
    const enderecoURL = encodeURIComponent(enderecoCompleto);
    
    // Criar link para o Google Maps
    // Se usarLocalizacaoAtual for true, o ponto de partida será a localização atual do usuário
    // Caso contrário, o Google Maps solicitará o ponto de partida
    if (usarLocalizacaoAtual) {
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoURL}&travelmode=driving`;
    } else {
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoURL}`;
    }
}

/**
 * Gera um link para abrir o Waze com uma rota para o endereço especificado
 * 
 * @param {Object} endereco - Objeto contendo os dados do endereço
 * @returns {string} - URL para o Waze com a rota
 */
function gerarLinkWaze(endereco) {
    // Formatar o endereço completo
    const enderecoCompleto = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}`;
    
    // Codificar o endereço para URL
    const enderecoURL = encodeURIComponent(enderecoCompleto);
    
    // Criar link para o Waze
    // O Waze sempre usa a localização atual como ponto de partida
    return `https://waze.com/ul?q=${enderecoURL}&navigate=yes`;
}

/**
 * Gera um link para abrir o Apple Maps com uma rota para o endereço especificado
 * 
 * @param {Object} endereco - Objeto contendo os dados do endereço
 * @returns {string} - URL para o Apple Maps com a rota
 */
function gerarLinkAppleMaps(endereco) {
    // Formatar o endereço completo
    const enderecoCompleto = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}`;
    
    // Codificar o endereço para URL
    const enderecoURL = encodeURIComponent(enderecoCompleto);
    
    // Criar link para o Apple Maps
    return `https://maps.apple.com/?daddr=${enderecoURL}&dirflg=d`;
}

/**
 * Gera links para diferentes aplicativos de GPS
 * 
 * @param {Object} endereco - Objeto contendo os dados do endereço
 * @returns {Object} - Objeto com links para diferentes aplicativos de GPS
 */
function gerarLinksGPS(endereco) {
    return {
        googleMaps: gerarLinkGoogleMaps(endereco),
        waze: gerarLinkWaze(endereco),
        appleMaps: gerarLinkAppleMaps(endereco)
    };
}

/**
 * Detecta o sistema operacional do dispositivo para sugerir o aplicativo de GPS mais adequado
 * 
 * @returns {string} - Nome do aplicativo de GPS recomendado ('googleMaps', 'waze', 'appleMaps')
 */
function detectarSistemaOperacional() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Verificar se é iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'appleMaps';
    }
    
    // Verificar se é Android
    if (/android/i.test(userAgent)) {
        return 'googleMaps';
    }
    
    // Padrão para outros sistemas
    return 'googleMaps';
}

/**
 * Gera um link para o aplicativo de GPS mais adequado com base no sistema operacional
 * 
 * @param {Object} endereco - Objeto contendo os dados do endereço
 * @returns {string} - URL para o aplicativo de GPS recomendado
 */
function gerarLinkGPSRecomendado(endereco) {
    const sistemaOperacional = detectarSistemaOperacional();
    const links = gerarLinksGPS(endereco);
    
    return links[sistemaOperacional];
}

/**
 * Abre o aplicativo de GPS recomendado com a rota para o endereço
 * 
 * @param {Object} endereco - Objeto contendo os dados do endereço
 * @param {string} appPreferido - (Opcional) Aplicativo preferido ('googleMaps', 'waze', 'appleMaps')
 */
function abrirGPSComRota(endereco, appPreferido = null) {
    const links = gerarLinksGPS(endereco);
    const app = appPreferido || detectarSistemaOperacional();
    
    // Abrir em uma nova aba
    window.open(links[app], '_blank');
}

// Exportar funções
export {
    gerarLinkGoogleMaps,
    gerarLinkWaze,
    gerarLinkAppleMaps,
    gerarLinksGPS,
    detectarSistemaOperacional,
    gerarLinkGPSRecomendado,
    abrirGPSComRota
};
