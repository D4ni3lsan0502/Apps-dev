// Funções para cálculo dinâmico de tempo e bloqueio na agenda

/**
 * Calcula a duração total de um agendamento com base nos serviços selecionados
 * Para cada serviço adicional, adiciona 30 minutos (meia hora) ao tempo base
 * 
 * @param {Array} servicos - Array de objetos de serviço com propriedade 'duracao'
 * @returns {number} - Duração total em minutos
 */
function calcularDuracaoTotal(servicos) {
    if (!servicos || servicos.length === 0) {
        return 0;
    }
    
    // Duração base do primeiro serviço
    let duracaoBase = servicos[0]?.duracao || 0;
    
    // Para cada serviço adicional, adiciona 30 minutos (meia hora)
    let duracaoAdicional = (servicos.length - 1) * 30;
    
    // Retorna a duração total
    return duracaoBase + duracaoAdicional;
}

/**
 * Formata a duração em minutos para exibição em horas e minutos
 * 
 * @param {number} duracaoMinutos - Duração em minutos
 * @returns {string} - Duração formatada (ex: "1h 30min")
 */
function formatarDuracao(duracaoMinutos) {
    const horas = Math.floor(duracaoMinutos / 60);
    const minutos = duracaoMinutos % 60;
    
    if (horas > 0 && minutos > 0) {
        return `${horas}h ${minutos}min`;
    } else if (horas > 0) {
        return `${horas}h`;
    } else {
        return `${minutos}min`;
    }
}

/**
 * Calcula o horário de término com base no horário de início e duração
 * 
 * @param {string} horarioInicio - Horário de início no formato "HH:MM"
 * @param {number} duracaoMinutos - Duração em minutos
 * @returns {string} - Horário de término no formato "HH:MM"
 */
function calcularHorarioTermino(horarioInicio, duracaoMinutos) {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    
    // Converter para minutos totais
    let totalMinutos = (horas * 60) + minutos + duracaoMinutos;
    
    // Calcular novas horas e minutos
    const novasHoras = Math.floor(totalMinutos / 60);
    const novosMinutos = totalMinutos % 60;
    
    // Formatar resultado
    return `${String(novasHoras).padStart(2, '0')}:${String(novosMinutos).padStart(2, '0')}`;
}

/**
 * Verifica se um horário está disponível na agenda
 * 
 * @param {Array} agendamentos - Array de agendamentos existentes
 * @param {string} data - Data no formato "YYYY-MM-DD"
 * @param {string} horarioInicio - Horário de início no formato "HH:MM"
 * @param {number} duracaoMinutos - Duração em minutos
 * @returns {boolean} - true se o horário estiver disponível, false caso contrário
 */
function verificarDisponibilidadeHorario(agendamentos, data, horarioInicio, duracaoMinutos) {
    // Calcular horário de término
    const horarioTermino = calcularHorarioTermino(horarioInicio, duracaoMinutos);
    
    // Converter horários para comparação
    const inicioSolicitado = new Date(`${data}T${horarioInicio}`);
    const terminoSolicitado = new Date(`${data}T${horarioTermino}`);
    
    // Filtrar agendamentos para a data especificada
    const agendamentosDoDia = agendamentos.filter(a => a.data === data);
    
    // Verificar se há conflito com algum agendamento existente
    for (const agendamento of agendamentosDoDia) {
        const inicioExistente = new Date(`${data}T${agendamento.horario}`);
        const terminoExistente = new Date(`${data}T${calcularHorarioTermino(agendamento.horario, agendamento.duracaoTotal)}`);
        
        // Verificar sobreposição
        if (
            (inicioSolicitado >= inicioExistente && inicioSolicitado < terminoExistente) ||
            (terminoSolicitado > inicioExistente && terminoSolicitado <= terminoExistente) ||
            (inicioSolicitado <= inicioExistente && terminoSolicitado >= terminoExistente)
        ) {
            return false; // Há conflito
        }
    }
    
    return true; // Não há conflito
}

/**
 * Gera horários disponíveis para um dia específico, considerando a duração do serviço
 * 
 * @param {Object} barbeiro - Objeto com informações do barbeiro
 * @param {string} data - Data no formato "YYYY-MM-DD"
 * @param {Array} agendamentos - Array de agendamentos existentes
 * @param {number} duracaoMinutos - Duração em minutos do serviço solicitado
 * @returns {Array} - Array de horários disponíveis no formato "HH:MM"
 */
function gerarHorariosDisponiveis(barbeiro, data, agendamentos, duracaoMinutos) {
    const horariosDisponiveis = [];
    
    // Determinar dia da semana (0 = Domingo, 1 = Segunda, etc.)
    const diaSemana = new Date(data).getDay();
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const horarioFuncionamento = barbeiro.horariosFuncionamento[diasSemana[diaSemana]];
    
    // Verificar se o barbeiro trabalha neste dia
    if (!horarioFuncionamento.disponivel) {
        return horariosDisponiveis; // Retorna array vazio
    }
    
    // Obter horário de início e fim
    const [horaInicio, minutoInicio] = horarioFuncionamento.inicio.split(':').map(Number);
    const [horaFim, minutoFim] = horarioFuncionamento.fim.split(':').map(Number);
    
    // Converter para minutos totais
    const inicioMinutos = (horaInicio * 60) + minutoInicio;
    const fimMinutos = (horaFim * 60) + minutoFim;
    
    // Gerar horários a cada 30 minutos
    for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += 30) {
        // Converter de volta para formato HH:MM
        const hora = Math.floor(minutos / 60);
        const minuto = minutos % 60;
        const horario = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
        
        // Verificar se o horário está disponível
        if (verificarDisponibilidadeHorario(agendamentos, data, horario, duracaoMinutos)) {
            // Verificar se o serviço cabe no horário de funcionamento
            const terminoMinutos = minutos + duracaoMinutos;
            if (terminoMinutos <= fimMinutos) {
                horariosDisponiveis.push(horario);
            }
        }
    }
    
    return horariosDisponiveis;
}

/**
 * Bloqueia um horário na agenda, adicionando um novo agendamento
 * 
 * @param {Array} agendamentos - Array de agendamentos existentes
 * @param {Object} novoAgendamento - Objeto com informações do novo agendamento
 * @returns {Array} - Array atualizado de agendamentos
 */
function bloquearHorarioAgenda(agendamentos, novoAgendamento) {
    // Verificar se o horário está disponível
    if (!verificarDisponibilidadeHorario(
        agendamentos, 
        novoAgendamento.data, 
        novoAgendamento.horario, 
        novoAgendamento.duracaoTotal
    )) {
        throw new Error('Horário indisponível');
    }
    
    // Adicionar novo agendamento
    return [...agendamentos, novoAgendamento];
}

// Exportar funções
export {
    calcularDuracaoTotal,
    formatarDuracao,
    calcularHorarioTermino,
    verificarDisponibilidadeHorario,
    gerarHorariosDisponiveis,
    bloquearHorarioAgenda
};
