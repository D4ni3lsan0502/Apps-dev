// Estrutura de dados atualizada para o BarberPro V2

// Modelo de dados do Barbeiro
const modeloBarbeiro = {
    id: "string", // Identificador único
    nome: "string",
    email: "string",
    telefone: "string",
    foto: "string", // URL da foto
    endereco: {
        rua: "string",
        numero: "string",
        complemento: "string",
        bairro: "string",
        cidade: "string",
        estado: "string",
        cep: "string"
    },
    tiposAtendimento: {
        barbearia: "boolean",
        domicilio: "boolean"
    },
    formasPagamento: {
        dinheiro: "boolean",
        cartaoCredito: "boolean",
        cartaoDebito: "boolean",
        pix: "boolean",
        transferencia: "boolean"
    },
    // Novos campos para pagamentos
    dadosPagamento: {
        pix: {
            chave: "string",
            tipo: "string" // CPF, CNPJ, Email, Telefone, Chave aleatória
        },
        dadosBancarios: {
            banco: "string",
            agencia: "string",
            conta: "string",
            digito: "string",
            tipoConta: "string" // Corrente, Poupança
        }
    },
    momentoPagamento: {
        antecipado50: "boolean",
        antecipado100: "boolean",
        noAtendimento: "boolean"
    },
    servicos: [
        {
            id: "string",
            nome: "string",
            descricao: "string",
            preco: "number",
            duracao: "number", // em minutos
            disponivel: "boolean"
        }
    ],
    horariosFuncionamento: {
        segunda: { inicio: "string", fim: "string", disponivel: "boolean" },
        terca: { inicio: "string", fim: "string", disponivel: "boolean" },
        quarta: { inicio: "string", fim: "string", disponivel: "boolean" },
        quinta: { inicio: "string", fim: "string", disponivel: "boolean" },
        sexta: { inicio: "string", fim: "string", disponivel: "boolean" },
        sabado: { inicio: "string", fim: "string", disponivel: "boolean" },
        domingo: { inicio: "string", fim: "string", disponivel: "boolean" }
    },
    avaliacoes: [
        {
            clienteId: "string",
            nota: "number",
            comentario: "string",
            data: "date"
        }
    ],
    dataCadastro: "date"
};

// Modelo de dados do Cliente
const modeloCliente = {
    id: "string", // Identificador único
    nome: "string",
    email: "string",
    telefone: "string",
    foto: "string", // URL da foto
    endereco: {
        rua: "string",
        numero: "string",
        complemento: "string",
        bairro: "string",
        cidade: "string",
        estado: "string",
        cep: "string"
    },
    preferencias: {
        tipoAtendimento: "string", // barbearia, domicilio
        servicos: ["string"], // IDs dos serviços de interesse
        formaPagamento: "string", // dinheiro, cartaoCredito, cartaoDebito, pix, transferencia
        momentoPagamento: "string" // antecipado50, antecipado100, noAtendimento
    },
    // Novo campo para favoritos
    favoritos: ["string"], // IDs dos barbeiros favoritos
    notificacoes: {
        email: "boolean",
        sms: "boolean",
        lembretes: "boolean",
        promocoes: "boolean"
    },
    dataCadastro: "date"
};

// Modelo de dados de Agendamento
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
    // Novo campo para duração total calculada
    duracaoTotal: "number", // em minutos, calculado com base na quantidade de serviços
    data: "date",
    horario: "string",
    local: "string", // barbearia, domicilio
    endereco: { // Se for a domicílio
        rua: "string",
        numero: "string",
        complemento: "string",
        bairro: "string",
        cidade: "string",
        estado: "string",
        cep: "string"
    },
    formaPagamento: "string", // dinheiro, cartaoCredito, cartaoDebito, pix, transferencia
    momentoPagamento: "string", // antecipado50, antecipado100, noAtendimento
    valorTotal: "number",
    // Novos campos para comprovante
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

// Funções utilitárias

// Função para calcular a duração total com base nos serviços selecionados
function calcularDuracaoTotal(servicos) {
    // Duração base do primeiro serviço
    let duracaoBase = servicos[0]?.duracao || 0;
    
    // Para cada serviço adicional, adiciona 30 minutos (meia hora)
    let duracaoAdicional = (servicos.length - 1) * 30;
    
    // Retorna a duração total
    return duracaoBase + duracaoAdicional;
}

// Função para verificar se um comprovante é necessário
function verificarNecessidadeComprovante(formaPagamento, momentoPagamento) {
    // Comprovante é necessário para PIX e transferência quando o pagamento é antecipado
    return (formaPagamento === 'pix' || formaPagamento === 'transferencia') && 
           (momentoPagamento === 'antecipado50' || momentoPagamento === 'antecipado100');
}

// Função para gerar horários disponíveis com base na agenda e duração do serviço
function gerarHorariosDisponiveis(barbeiro, data, duracaoServico) {
    // Implementação da lógica para gerar horários disponíveis
    // considerando a duração do serviço e bloqueando os horários adequadamente
    
    // Esta é uma implementação simplificada
    const horariosDisponiveis = [];
    const diaSemana = new Date(data).getDay();
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const horarioFuncionamento = barbeiro.horariosFuncionamento[diasSemana[diaSemana]];
    
    if (horarioFuncionamento.disponivel) {
        const inicio = parseInt(horarioFuncionamento.inicio.split(':')[0]);
        const fim = parseInt(horarioFuncionamento.fim.split(':')[0]);
        
        // Gera horários a cada 30 minutos
        for (let hora = inicio; hora < fim; hora++) {
            horariosDisponiveis.push(`${hora}:00`);
            horariosDisponiveis.push(`${hora}:30`);
        }
    }
    
    return horariosDisponiveis;
}

// Exporta os modelos e funções
export {
    modeloBarbeiro,
    modeloCliente,
    modeloAgendamento,
    calcularDuracaoTotal,
    verificarNecessidadeComprovante,
    gerarHorariosDisponiveis
};
