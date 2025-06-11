// Funções para gerenciar o fluxo de agendamento com validação de comprovante

/**
 * Verifica se o método de pagamento selecionado requer comprovante antecipado
 * 
 * @param {string} formaPagamento - Forma de pagamento selecionada (pix, transferencia, etc)
 * @param {string} momentoPagamento - Momento do pagamento (antecipado50, antecipado100, noAtendimento)
 * @returns {boolean} - true se necessário comprovante antecipado, false caso contrário
 */
function requerComprovanteAntecipado(formaPagamento, momentoPagamento) {
    // Comprovante antecipado é necessário para PIX e transferência quando o pagamento é antecipado
    return (formaPagamento === 'pix' || formaPagamento === 'transferencia') && 
           (momentoPagamento === 'antecipado50' || momentoPagamento === 'antecipado100');
}

/**
 * Gerencia o estado do botão de confirmação de agendamento com base no upload do comprovante
 * 
 * @param {string} formaPagamento - Forma de pagamento selecionada
 * @param {string} momentoPagamento - Momento do pagamento
 * @param {boolean} comprovanteEnviado - Se o comprovante foi enviado
 * @param {HTMLElement} botaoConfirmar - Elemento do botão de confirmação
 */
function gerenciarBotaoConfirmacao(formaPagamento, momentoPagamento, comprovanteEnviado, botaoConfirmar) {
    if (requerComprovanteAntecipado(formaPagamento, momentoPagamento)) {
        if (comprovanteEnviado) {
            // Habilitar botão de confirmação
            botaoConfirmar.disabled = false;
            botaoConfirmar.classList.remove('bg-gray-400', 'cursor-not-allowed');
            botaoConfirmar.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            // Desabilitar botão de confirmação
            botaoConfirmar.disabled = true;
            botaoConfirmar.classList.remove('bg-green-600', 'hover:bg-green-700');
            botaoConfirmar.classList.add('bg-gray-400', 'cursor-not-allowed');
        }
    } else {
        // Para outras formas de pagamento, sempre habilitar
        botaoConfirmar.disabled = false;
        botaoConfirmar.classList.remove('bg-gray-400', 'cursor-not-allowed');
        botaoConfirmar.classList.add('bg-green-600', 'hover:bg-green-700');
    }
}

/**
 * Atualiza a interface de pagamento com base na forma e momento selecionados
 * 
 * @param {string} formaPagamento - Forma de pagamento selecionada
 * @param {string} momentoPagamento - Momento do pagamento
 * @param {Object} elementos - Objeto com referências aos elementos da interface
 */
function atualizarInterfacePagamento(formaPagamento, momentoPagamento, elementos) {
    const { 
        secaoComprovante, 
        secaoDadosPix, 
        secaoDadosTransferencia, 
        botaoConfirmar,
        mensagemComprovante
    } = elementos;
    
    // Verificar se requer comprovante antecipado
    const requerComprovante = requerComprovanteAntecipado(formaPagamento, momentoPagamento);
    
    // Mostrar/esconder seção de comprovante
    if (requerComprovante) {
        secaoComprovante.classList.remove('hidden');
        mensagemComprovante.textContent = 'Atenção: Você precisa enviar o comprovante de pagamento para confirmar seu agendamento';
        
        // Mostrar dados de pagamento apropriados
        if (formaPagamento === 'pix') {
            secaoDadosPix.classList.remove('hidden');
            secaoDadosTransferencia.classList.add('hidden');
        } else if (formaPagamento === 'transferencia') {
            secaoDadosPix.classList.add('hidden');
            secaoDadosTransferencia.classList.remove('hidden');
        }
        
        // Desabilitar botão de confirmação até que o comprovante seja enviado
        gerenciarBotaoConfirmacao(formaPagamento, momentoPagamento, false, botaoConfirmar);
    } else {
        secaoComprovante.classList.add('hidden');
        secaoDadosPix.classList.add('hidden');
        secaoDadosTransferencia.classList.add('hidden');
        
        // Habilitar botão de confirmação
        gerenciarBotaoConfirmacao(formaPagamento, momentoPagamento, true, botaoConfirmar);
    }
}

/**
 * Processa o upload do comprovante e atualiza a interface
 * 
 * @param {File} arquivo - Arquivo do comprovante
 * @param {Function} callbackSucesso - Função a ser chamada em caso de sucesso
 * @param {Function} callbackErro - Função a ser chamada em caso de erro
 */
function processarUploadComprovante(arquivo, callbackSucesso, callbackErro) {
    // Validar o arquivo
    if (!arquivo) {
        callbackErro('Nenhum arquivo selecionado');
        return;
    }
    
    // Verificar tamanho do arquivo (máximo 5MB)
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
    if (arquivo.size > tamanhoMaximo) {
        callbackErro('O arquivo excede o tamanho máximo de 5MB');
        return;
    }
    
    // Verificar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!tiposPermitidos.includes(arquivo.type)) {
        callbackErro('Formato de arquivo não suportado. Use JPG, PNG, GIF ou PDF');
        return;
    }
    
    // Simular upload (em um ambiente real, enviaria para o servidor)
    setTimeout(() => {
        // Simular sucesso
        callbackSucesso({
            nome: arquivo.name,
            tipo: arquivo.type,
            tamanho: arquivo.size,
            dataEnvio: new Date().toISOString()
        });
    }, 1500); // Simular 1.5 segundos de upload
}

/**
 * Inicializa o fluxo de agendamento com validação de comprovante
 * 
 * @param {Object} config - Configuração do fluxo
 */
function inicializarFluxoAgendamento(config) {
    const {
        seletorFormaPagamento,
        seletorMomentoPagamento,
        seletorInputComprovante,
        seletorBotaoEnviarComprovante,
        seletorBotaoConfirmar,
        seletorSecaoComprovante,
        seletorSecaoDadosPix,
        seletorSecaoDadosTransferencia,
        seletorMensagemComprovante,
        seletorNomeArquivo,
        callbackComprovanteEnviado,
        callbackAgendamentoConfirmado
    } = config;
    
    // Obter elementos
    const formaPagamentoSelect = document.querySelector(seletorFormaPagamento);
    const momentoPagamentoSelect = document.querySelector(seletorMomentoPagamento);
    const inputComprovante = document.querySelector(seletorInputComprovante);
    const botaoEnviarComprovante = document.querySelector(seletorBotaoEnviarComprovante);
    const botaoConfirmar = document.querySelector(seletorBotaoConfirmar);
    const secaoComprovante = document.querySelector(seletorSecaoComprovante);
    const secaoDadosPix = document.querySelector(seletorSecaoDadosPix);
    const secaoDadosTransferencia = document.querySelector(seletorSecaoDadosTransferencia);
    const mensagemComprovante = document.querySelector(seletorMensagemComprovante);
    const nomeArquivo = document.querySelector(seletorNomeArquivo);
    
    // Estado do comprovante
    let comprovanteEnviado = false;
    let dadosComprovante = null;
    
    // Atualizar interface quando a forma de pagamento mudar
    formaPagamentoSelect.addEventListener('change', () => {
        const formaPagamento = formaPagamentoSelect.value;
        const momentoPagamento = momentoPagamentoSelect.value;
        
        atualizarInterfacePagamento(formaPagamento, momentoPagamento, {
            secaoComprovante,
            secaoDadosPix,
            secaoDadosTransferencia,
            botaoConfirmar,
            mensagemComprovante
        });
        
        // Resetar estado do comprovante
        comprovanteEnviado = false;
        dadosComprovante = null;
        if (inputComprovante) inputComprovante.value = '';
        if (nomeArquivo) nomeArquivo.textContent = 'Nenhum arquivo selecionado';
        if (botaoEnviarComprovante) botaoEnviarComprovante.disabled = true;
        
        // Atualizar estado do botão de confirmação
        gerenciarBotaoConfirmacao(formaPagamento, momentoPagamento, comprovanteEnviado, botaoConfirmar);
    });
    
    // Atualizar interface quando o momento de pagamento mudar
    momentoPagamentoSelect.addEventListener('change', () => {
        const formaPagamento = formaPagamentoSelect.value;
        const momentoPagamento = momentoPagamentoSelect.value;
        
        atualizarInterfacePagamento(formaPagamento, momentoPagamento, {
            secaoComprovante,
            secaoDadosPix,
            secaoDadosTransferencia,
            botaoConfirmar,
            mensagemComprovante
        });
        
        // Resetar estado do comprovante
        comprovanteEnviado = false;
        dadosComprovante = null;
        if (inputComprovante) inputComprovante.value = '';
        if (nomeArquivo) nomeArquivo.textContent = 'Nenhum arquivo selecionado';
        if (botaoEnviarComprovante) botaoEnviarComprovante.disabled = true;
        
        // Atualizar estado do botão de confirmação
        gerenciarBotaoConfirmacao(formaPagamento, momentoPagamento, comprovanteEnviado, botaoConfirmar);
    });
    
    // Gerenciar seleção de arquivo
    if (inputComprovante) {
        inputComprovante.addEventListener('change', () => {
            if (inputComprovante.files && inputComprovante.files[0]) {
                const arquivo = inputComprovante.files[0];
                
                // Atualizar nome do arquivo
                if (nomeArquivo) {
                    nomeArquivo.textContent = arquivo.name;
                }
                
                // Habilitar botão de envio
                if (botaoEnviarComprovante) {
                    botaoEnviarComprovante.disabled = false;
                }
            } else {
                // Resetar interface
                if (nomeArquivo) {
                    nomeArquivo.textContent = 'Nenhum arquivo selecionado';
                }
                
                if (botaoEnviarComprovante) {
                    botaoEnviarComprovante.disabled = true;
                }
            }
        });
    }
    
    // Gerenciar envio de comprovante
    if (botaoEnviarComprovante) {
        botaoEnviarComprovante.addEventListener('click', () => {
            if (!inputComprovante.files || !inputComprovante.files[0]) {
                return;
            }
            
            const arquivo = inputComprovante.files[0];
            
            // Desabilitar botão durante o upload
            botaoEnviarComprovante.disabled = true;
            botaoEnviarComprovante.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Enviando...';
            
            // Processar upload
            processarUploadComprovante(
                arquivo,
                (dados) => {
                    // Sucesso
                    comprovanteEnviado = true;
                    dadosComprovante = dados;
                    
                    // Atualizar interface
                    botaoEnviarComprovante.innerHTML = '<i class="fas fa-check mr-1"></i> Enviado';
                    mensagemComprovante.textContent = 'Comprovante enviado com sucesso! Agora você pode confirmar seu agendamento.';
                    
                    // Habilitar botão de confirmação
                    const formaPagamento = formaPagamentoSelect.value;
                    const momentoPagamento = momentoPagamentoSelect.value;
                    gerenciarBotaoConfirmacao(formaPagamento, momentoPagamento, comprovanteEnviado, botaoConfirmar);
                    
                    // Chamar callback
                    if (callbackComprovanteEnviado) {
                        callbackComprovanteEnviado(dados);
                    }
                },
                (erro) => {
                    // Erro
                    alert(erro);
                    
                    // Resetar interface
                    botaoEnviarComprovante.disabled = false;
                    botaoEnviarComprovante.innerHTML = 'Enviar Comprovante';
                }
            );
        });
    }
    
    // Gerenciar confirmação de agendamento
    if (botaoConfirmar) {
        botaoConfirmar.addEventListener('click', () => {
            const formaPagamento = formaPagamentoSelect.value;
            const momentoPagamento = momentoPagamentoSelect.value;
            
            // Verificar se precisa de comprovante
            if (requerComprovanteAntecipado(formaPagamento, momentoPagamento) && !comprovanteEnviado) {
                alert('Você precisa enviar o comprovante de pagamento antes de confirmar o agendamento.');
                return;
            }
            
            // Chamar callback de confirmação
            if (callbackAgendamentoConfirmado) {
                callbackAgendamentoConfirmado({
                    formaPagamento,
                    momentoPagamento,
                    comprovante: dadosComprovante
                });
            }
        });
    }
    
    // Inicializar interface
    const formaPagamentoInicial = formaPagamentoSelect.value;
    const momentoPagamentoInicial = momentoPagamentoSelect.value;
    
    atualizarInterfacePagamento(formaPagamentoInicial, momentoPagamentoInicial, {
        secaoComprovante,
        secaoDadosPix,
        secaoDadosTransferencia,
        botaoConfirmar,
        mensagemComprovante
    });
}

// Exportar funções
export {
    requerComprovanteAntecipado,
    gerenciarBotaoConfirmacao,
    atualizarInterfacePagamento,
    processarUploadComprovante,
    inicializarFluxoAgendamento
};
