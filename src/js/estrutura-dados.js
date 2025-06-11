// Estrutura de dados para o BarberPro

// Estrutura para Barbeiro
const barbeiroDadosEstrutura = {
  // Dados pessoais
  id: "string", // Identificador único
  nome: "string",
  email: "string",
  senha: "string (hash)",
  telefone: "string",
  foto: "string (URL)",
  
  // Dados profissionais
  especialidades: ["string"], // Ex: ["Corte masculino", "Barba", "Sobrancelha"]
  descricao: "string", // Biografia/descrição profissional
  experiencia: "number", // Anos de experiência
  
  // Configurações de atendimento
  tiposAtendimento: {
    barbearia: "boolean",
    domicilio: "boolean",
    raioAtendimentoDomicilio: "number" // Em km
  },
  
  // Endereço do estabelecimento (se aplicável)
  endereco: {
    rua: "string",
    numero: "string",
    complemento: "string",
    bairro: "string",
    cidade: "string",
    estado: "string",
    cep: "string",
    coordenadas: {
      latitude: "number",
      longitude: "number"
    }
  },
  
  // Formas de contato
  contatoPreferencial: "string", // Ex: "whatsapp", "telefone", "email"
  redesSociais: {
    instagram: "string",
    facebook: "string",
    twitter: "string"
  },
  
  // Configurações de pagamento
  formasPagamento: {
    dinheiro: "boolean",
    pix: "boolean",
    cartaoCredito: "boolean",
    cartaoDebito: "boolean",
    transferencia: "boolean"
  },
  
  // Opções de momento do pagamento
  momentoPagamento: {
    antecipado50: "boolean", // 50% antecipado
    antecipado100: "boolean", // 100% antecipado
    noAtendimento: "boolean" // Pagamento no momento do atendimento
  },
  
  // Horários de trabalho
  horarioTrabalho: [
    {
      diaSemana: "number", // 0-6 (domingo-sábado)
      inicio: "string", // Ex: "08:00"
      fim: "string", // Ex: "18:00"
      intervalo: {
        inicio: "string", // Ex: "12:00"
        fim: "string" // Ex: "13:00"
      }
    }
  ],
  
  // Serviços oferecidos
  servicos: [
    {
      id: "string",
      nome: "string",
      descricao: "string",
      preco: "number",
      duracao: "number", // Em minutos
      disponivel: "boolean"
    }
  ],
  
  // Configurações de agendamento
  configuracoesAgendamento: {
    intervaloEntreAgendamentos: "number", // Em minutos
    antecedenciaMinima: "number", // Em horas
    antecedenciaMaxima: "number", // Em dias
    permiteCancelamento: "boolean",
    tempoMinimoCancelamento: "number" // Em horas
  },
  
  // Estatísticas
  estatisticas: {
    clientesAtendidos: "number",
    avaliacaoMedia: "number",
    faturamentoMensal: "number"
  },
  
  // Preferências de notificação
  notificacoes: {
    email: "boolean",
    sms: "boolean",
    push: "boolean"
  },
  
  dataCadastro: "date",
  ultimoAcesso: "date"
};

// Estrutura para Cliente
const clienteDadosEstrutura = {
  // Dados pessoais
  id: "string", // Identificador único
  nome: "string",
  email: "string",
  senha: "string (hash)",
  telefone: "string",
  foto: "string (URL)",
  
  // Endereço para atendimento a domicílio
  endereco: {
    rua: "string",
    numero: "string",
    complemento: "string",
    bairro: "string",
    cidade: "string",
    estado: "string",
    cep: "string",
    coordenadas: {
      latitude: "number",
      longitude: "number"
    }
  },
  
  // Preferências
  preferencias: {
    tipoAtendimentoPreferido: "string", // "barbearia" ou "domicilio"
    barbeirosPreferidos: ["string"], // IDs dos barbeiros favoritos
    servicosFrequentes: ["string"], // IDs dos serviços mais utilizados
    formaPagamentoPreferida: "string" // Ex: "pix", "dinheiro", "cartao"
  },
  
  // Histórico de agendamentos
  historicoAgendamentos: [
    {
      id: "string",
      barbeiroId: "string",
      servicoId: "string",
      data: "date",
      horario: "string",
      local: "string", // "barbearia" ou "domicilio"
      status: "string", // "agendado", "concluido", "cancelado"
      valorPago: "number",
      formaPagamento: "string",
      momentoPagamento: "string", // "antecipado", "no_atendimento"
      avaliacao: {
        nota: "number", // 1-5
        comentario: "string"
      }
    }
  ],
  
  // Notificações
  notificacoes: {
    email: "boolean",
    sms: "boolean",
    push: "boolean"
  },
  
  dataCadastro: "date",
  ultimoAcesso: "date"
};

// Estrutura para Agendamento
const agendamentoDadosEstrutura = {
  id: "string",
  clienteId: "string",
  barbeiroId: "string",
  
  // Detalhes do agendamento
  servicos: [
    {
      id: "string",
      nome: "string",
      preco: "number",
      duracao: "number" // Em minutos
    }
  ],
  
  // Data e horário
  data: "date",
  horarioInicio: "string",
  horarioFim: "string",
  
  // Local e pagamento
  local: "string", // "barbearia" ou "domicilio"
  endereco: {
    // Se for a domicílio, usa o endereço do cliente
    // Se for na barbearia, usa o endereço do barbeiro
  },
  
  // Pagamento
  valorTotal: "number",
  formaPagamento: "string",
  momentoPagamento: "string", // "antecipado_50", "antecipado_100", "no_atendimento"
  statusPagamento: "string", // "pendente", "parcial", "pago"
  
  // Status do agendamento
  status: "string", // "agendado", "confirmado", "em_andamento", "concluido", "cancelado"
  
  // Observações
  observacoesCliente: "string",
  observacoesBarbeiro: "string",
  
  // Datas de controle
  dataCriacao: "date",
  dataAtualizacao: "date"
};
