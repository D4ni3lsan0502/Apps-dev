// Funções para gerenciamento de upload de comprovante de pagamento

/**
 * Verifica se é necessário comprovante para o método de pagamento selecionado
 * 
 * @param {string} formaPagamento - Forma de pagamento (pix, transferencia, etc)
 * @param {string} momentoPagamento - Momento do pagamento (antecipado50, antecipado100, noAtendimento)
 * @returns {boolean} - true se necessário comprovante, false caso contrário
 */
function necessitaComprovante(formaPagamento, momentoPagamento) {
    // Comprovante é necessário para PIX e transferência quando o pagamento é antecipado
    return (formaPagamento === 'pix' || formaPagamento === 'transferencia') && 
           (momentoPagamento === 'antecipado50' || momentoPagamento === 'antecipado100');
}

/**
 * Valida o arquivo de comprovante enviado
 * 
 * @param {File} arquivo - Objeto File do comprovante
 * @returns {Object} - Objeto com status da validação e mensagem
 */
function validarComprovante(arquivo) {
    // Verificar se arquivo foi fornecido
    if (!arquivo) {
        return {
            valido: false,
            mensagem: 'Nenhum arquivo selecionado'
        };
    }
    
    // Verificar tamanho do arquivo (máximo 5MB)
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
    if (arquivo.size > tamanhoMaximo) {
        return {
            valido: false,
            mensagem: 'O arquivo excede o tamanho máximo de 5MB'
        };
    }
    
    // Verificar tipo de arquivo (apenas imagens e PDF)
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!tiposPermitidos.includes(arquivo.type)) {
        return {
            valido: false,
            mensagem: 'Formato de arquivo não suportado. Use JPG, PNG, GIF ou PDF'
        };
    }
    
    return {
        valido: true,
        mensagem: 'Arquivo válido'
    };
}

/**
 * Simula o upload de um comprovante (em ambiente real, enviaria para o servidor)
 * 
 * @param {File} arquivo - Objeto File do comprovante
 * @param {string} agendamentoId - ID do agendamento
 * @returns {Promise} - Promise com resultado do upload
 */
function uploadComprovante(arquivo, agendamentoId) {
    return new Promise((resolve, reject) => {
        // Validar o arquivo
        const validacao = validarComprovante(arquivo);
        if (!validacao.valido) {
            reject(validacao.mensagem);
            return;
        }
        
        // Simular tempo de upload
        setTimeout(() => {
            // Em um ambiente real, aqui seria feito o upload para o servidor
            // e retornaria a URL do arquivo no servidor
            
            // Simular URL do arquivo
            const dataAtual = new Date().toISOString().replace(/[:.]/g, '-');
            const nomeArquivo = arquivo.name.replace(/\s+/g, '_');
            const urlArquivo = `comprovantes/${agendamentoId}_${dataAtual}_${nomeArquivo}`;
            
            resolve({
                sucesso: true,
                url: urlArquivo,
                dataEnvio: new Date().toISOString(),
                status: 'pendente' // pendente, aprovado, rejeitado
            });
        }, 1500); // Simular 1.5 segundos de upload
    });
}

/**
 * Atualiza o status do agendamento após o upload do comprovante
 * 
 * @param {Object} agendamento - Objeto do agendamento
 * @param {Object} dadosComprovante - Dados do comprovante enviado
 * @returns {Object} - Agendamento atualizado
 */
function atualizarStatusAgendamento(agendamento, dadosComprovante) {
    // Clonar o agendamento para não modificar o original
    const agendamentoAtualizado = { ...agendamento };
    
    // Atualizar dados do comprovante
    agendamentoAtualizado.comprovante = {
        ...agendamentoAtualizado.comprovante,
        arquivo: dadosComprovante.url,
        dataEnvio: dadosComprovante.dataEnvio,
        status: dadosComprovante.status
    };
    
    // Atualizar status do agendamento
    // Se for pagamento antecipado, o status fica como "pendente de confirmação"
    // até que o barbeiro aprove o comprovante
    if (agendamentoAtualizado.momentoPagamento === 'antecipado50' || 
        agendamentoAtualizado.momentoPagamento === 'antecipado100') {
        agendamentoAtualizado.status = 'pendente_confirmacao';
    } else {
        agendamentoAtualizado.status = 'confirmado';
    }
    
    return agendamentoAtualizado;
}

/**
 * Obtém os dados de pagamento do barbeiro para exibição ao cliente
 * 
 * @param {Object} barbeiro - Objeto com dados do barbeiro
 * @param {string} formaPagamento - Forma de pagamento selecionada
 * @returns {Object} - Dados de pagamento formatados para exibição
 */
function obterDadosPagamento(barbeiro, formaPagamento) {
    if (formaPagamento === 'pix') {
        return {
            tipo: 'PIX',
            chave: barbeiro.dadosPagamento.pix.chave,
            tipoChave: barbeiro.dadosPagamento.pix.tipo,
            instrucoes: 'Faça o pagamento via PIX usando a chave acima e envie o comprovante para confirmar seu agendamento.'
        };
    } else if (formaPagamento === 'transferencia') {
        return {
            tipo: 'Transferência Bancária',
            banco: barbeiro.dadosPagamento.dadosBancarios.banco,
            agencia: barbeiro.dadosPagamento.dadosBancarios.agencia,
            conta: barbeiro.dadosPagamento.dadosBancarios.conta,
            digito: barbeiro.dadosPagamento.dadosBancarios.digito,
            tipoConta: barbeiro.dadosPagamento.dadosBancarios.tipoConta,
            instrucoes: 'Faça a transferência usando os dados bancários acima e envie o comprovante para confirmar seu agendamento.'
        };
    } else {
        return {
            tipo: formaPagamento === 'dinheiro' ? 'Dinheiro' : 
                 formaPagamento === 'credito' ? 'Cartão de Crédito' : 
                 formaPagamento === 'debito' ? 'Cartão de Débito' : 'Outro',
            instrucoes: 'Pagamento será realizado no momento do atendimento.'
        };
    }
}

// Exportar funções
export {
    necessitaComprovante,
    validarComprovante,
    uploadComprovante,
    atualizarStatusAgendamento,
    obterDadosPagamento
};
