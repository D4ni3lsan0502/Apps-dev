// Sistema de armazenamento persistente para agendamentos
const AgendamentoStorage = {
  // Chave para armazenamento local
  STORAGE_KEY: 'barberpro_agendamentos',
  
  // Obter todos os agendamentos
  getAll: function() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao recuperar agendamentos:', e);
      return [];
    }
  },
  
  // Obter agendamentos por ID do barbeiro
  getByBarbeiro: function(barbeiroId) {
    return this.getAll().filter(item => item.barbeiroId === barbeiroId);
  },
  
  // Obter agendamentos por ID do cliente
  getByCliente: function(clienteId) {
    return this.getAll().filter(item => item.clienteId === clienteId);
  },
  
  // Adicionar novo agendamento
  add: function(agendamento) {
    if (!agendamento) return false;
    
    // Garantir que o agendamento tenha um ID único
    if (!agendamento.id) {
      agendamento.id = 'agd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Garantir que tenha data de criação
    if (!agendamento.createdAt) {
      agendamento.createdAt = new Date().toISOString();
    }
    
    // Adicionar à lista
    const agendamentos = this.getAll();
    agendamentos.push(agendamento);
    
    // Salvar no localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(agendamentos));
      return true;
    } catch (e) {
      console.error('Erro ao salvar agendamento:', e);
      return false;
    }
  },
  
  // Atualizar agendamento existente
  update: function(id, dadosAtualizados) {
    const agendamentos = this.getAll();
    const index = agendamentos.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    // Atualizar dados
    agendamentos[index] = { ...agendamentos[index], ...dadosAtualizados, updatedAt: new Date().toISOString() };
    
    // Salvar no localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(agendamentos));
      return true;
    } catch (e) {
      console.error('Erro ao atualizar agendamento:', e);
      return false;
    }
  },
  
  // Remover agendamento
  remove: function(id) {
    const agendamentos = this.getAll();
    const filtrados = agendamentos.filter(item => item.id !== id);
    
    if (filtrados.length === agendamentos.length) return false;
    
    // Salvar no localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtrados));
      return true;
    } catch (e) {
      console.error('Erro ao remover agendamento:', e);
      return false;
    }
  },
  
  // Limpar todos os agendamentos (cuidado!)
  clear: function() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Erro ao limpar agendamentos:', e);
      return false;
    }
  }
};

// Sistema de gerenciamento de itens e quantidades
const ItemQuantidadeManager = {
  // Adicionar item ao agendamento com quantidade
  adicionarItem: function(agendamentoId, item, quantidade = 1) {
    if (!agendamentoId || !item) return false;
    
    // Buscar agendamento
    const agendamentos = AgendamentoStorage.getAll();
    const index = agendamentos.findIndex(a => a.id === agendamentoId);
    
    if (index === -1) return false;
    
    // Inicializar array de itens se não existir
    if (!agendamentos[index].itens) {
      agendamentos[index].itens = [];
    }
    
    // Verificar se o item já existe
    const itemIndex = agendamentos[index].itens.findIndex(i => i.id === item.id);
    
    if (itemIndex === -1) {
      // Adicionar novo item com quantidade
      agendamentos[index].itens.push({
        ...item,
        quantidade: quantidade
      });
    } else {
      // Atualizar quantidade do item existente
      agendamentos[index].itens[itemIndex].quantidade += quantidade;
    }
    
    // Recalcular valor total
    this.recalcularTotal(agendamentos[index]);
    
    // Salvar no localStorage
    try {
      localStorage.setItem(AgendamentoStorage.STORAGE_KEY, JSON.stringify(agendamentos));
      return true;
    } catch (e) {
      console.error('Erro ao adicionar item:', e);
      return false;
    }
  },
  
  // Atualizar quantidade de um item
  atualizarQuantidade: function(agendamentoId, itemId, quantidade) {
    if (!agendamentoId || !itemId || quantidade < 1) return false;
    
    // Buscar agendamento
    const agendamentos = AgendamentoStorage.getAll();
    const index = agendamentos.findIndex(a => a.id === agendamentoId);
    
    if (index === -1 || !agendamentos[index].itens) return false;
    
    // Buscar item
    const itemIndex = agendamentos[index].itens.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return false;
    
    // Atualizar quantidade
    agendamentos[index].itens[itemIndex].quantidade = quantidade;
    
    // Recalcular valor total
    this.recalcularTotal(agendamentos[index]);
    
    // Salvar no localStorage
    try {
      localStorage.setItem(AgendamentoStorage.STORAGE_KEY, JSON.stringify(agendamentos));
      return true;
    } catch (e) {
      console.error('Erro ao atualizar quantidade:', e);
      return false;
    }
  },
  
  // Remover item do agendamento
  removerItem: function(agendamentoId, itemId) {
    if (!agendamentoId || !itemId) return false;
    
    // Buscar agendamento
    const agendamentos = AgendamentoStorage.getAll();
    const index = agendamentos.findIndex(a => a.id === agendamentoId);
    
    if (index === -1 || !agendamentos[index].itens) return false;
    
    // Filtrar itens
    agendamentos[index].itens = agendamentos[index].itens.filter(i => i.id !== itemId);
    
    // Recalcular valor total
    this.recalcularTotal(agendamentos[index]);
    
    // Salvar no localStorage
    try {
      localStorage.setItem(AgendamentoStorage.STORAGE_KEY, JSON.stringify(agendamentos));
      return true;
    } catch (e) {
      console.error('Erro ao remover item:', e);
      return false;
    }
  },
  
  // Recalcular valor total do agendamento
  recalcularTotal: function(agendamento) {
    if (!agendamento || !agendamento.itens) return;
    
    // Calcular valor total com base nos itens e suas quantidades
    agendamento.valorTotal = agendamento.itens.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
    
    // Calcular duração total com base nos itens e suas quantidades
    // Primeiro serviço com duração completa, demais com +30min por serviço
    let duracaoTotal = 0;
    
    agendamento.itens.forEach((item, index) => {
      if (index === 0) {
        // Primeiro serviço com duração completa
        duracaoTotal += (item.duracao || 30) * item.quantidade;
      } else {
        // Serviços adicionais: +30min por serviço
        duracaoTotal += 30 * item.quantidade;
      }
    });
    
    agendamento.duracaoTotal = duracaoTotal;
  }
};

// Exportar para uso global
window.BarberPro = window.BarberPro || {};
window.BarberPro.AgendamentoStorage = AgendamentoStorage;
window.BarberPro.ItemQuantidadeManager = ItemQuantidadeManager;
