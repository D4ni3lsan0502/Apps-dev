// Estrutura de dados atualizada para o BarberPro V5

// Modelo de dados do Agendamento com endereço estruturado
const modeloAgendamento = {
    id: "string", // Identificador único
    clienteId: "string",
    barbeiroId: "string",
    servicos: [
        {
            id: "string",
            nome: "string",
            preco: "number",
            duracao: "number" // em minutos
        }
    ],
    // Duração total calculada
    duracaoTotal: "number", // em minutos, calculado com base na quantidade de serviços
    data: "date",
    horario: "string",
    local: "string", // barbearia, domicilio
    // Endereço estruturado para facilitar geração de rotas GPS
    endereco: { 
        rua: "string",
        numero: "string",
        complemento: "string",
        bairro: "string",
        cidade: "string",
        estado: "string",
        cep: "string",
        // Coordenadas para uso direto em aplicativos de GPS
        latitude: "number", // opcional, se disponível
        longitude: "number" // opcional, se disponível
    },
    formaPagamento: "string", // dinheiro, cartaoCredito, cartaoDebito, pix, transferencia
    momentoPagamento: "string", // antecipado50, antecipado100, noAtendimento
    valorTotal: "number",
    // Dados de comprovante
    comprovante: {
        necessario: "boolean", // true para pix e transferência
        arquivo: "string", // URL do arquivo
        dataEnvio: "date",
        status: "string" // pendente, aprovado, rejeitado
    },
    status: "string", // pendente, confirmado, concluido, cancelado
    observacoes: "string",
    dataCriacao: "date"
};

// Função para gerar objeto de endereço estruturado a partir de texto ou campos separados
function criarEnderecoEstruturado(dados) {
    // Se for um objeto com os campos já separados
    if (typeof dados === 'object' && dados !== null) {
        return {
            rua: dados.rua || '',
            numero: dados.numero || '',
            complemento: dados.complemento || '',
            bairro: dados.bairro || '',
            cidade: dados.cidade || '',
            estado: dados.estado || '',
            cep: dados.cep || '',
            latitude: dados.latitude || null,
            longitude: dados.longitude || null
        };
    }
    
    // Se for uma string (endereço completo)
    if (typeof dados === 'string') {
        // Tentativa simples de extrair partes do endereço
        // Em um ambiente real, seria melhor usar uma API de geocodificação
        const partes = dados.split(',').map(parte => parte.trim());
        
        return {
            rua: partes[0] || '',
            numero: partes[1] || '',
            complemento: '',
            bairro: partes[2] || '',
            cidade: partes[3] || '',
            estado: partes[4] || '',
            cep: partes[5] || '',
            latitude: null,
            longitude: null
        };
    }
    
    // Retornar objeto vazio se nenhum dado válido for fornecido
    return {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        latitude: null,
        longitude: null
    };
}

// Função para formatar endereço para exibição
function formatarEnderecoParaExibicao(endereco) {
    if (!endereco) return '';
    
    let enderecoFormatado = endereco.rua;
    
    if (endereco.numero) {
        enderecoFormatado += `, ${endereco.numero}`;
    }
    
    if (endereco.complemento) {
        enderecoFormatado += ` - ${endereco.complemento}`;
    }
    
    if (endereco.bairro) {
        enderecoFormatado += `, ${endereco.bairro}`;
    }
    
    if (endereco.cidade) {
        enderecoFormatado += `, ${endereco.cidade}`;
    }
    
    if (endereco.estado) {
        enderecoFormatado += ` - ${endereco.estado}`;
    }
    
    if (endereco.cep) {
        enderecoFormatado += `, CEP: ${endereco.cep}`;
    }
    
    return enderecoFormatado;
}

// Exportar modelos e funções
export {
    modeloAgendamento,
    criarEnderecoEstruturado,
    formatarEnderecoParaExibicao
};
