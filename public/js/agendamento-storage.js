// Sistema de armazenamento persistente para agendamentos via API real
const AgendamentoStorage = {
  // Obter todos os agendamentos do usuário logado (cliente ou barbeiro)
  getAll: async function() {
    try {
      const token = localStorage.getItem('barberpro_token');
      if (!token) return [];

      const response = await fetch('/api/agendamentos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return [];

      const data = await response.json();
      return data;
    } catch (e) {
      console.error('Erro ao recuperar agendamentos da API:', e);
      return [];
    }
  },
  
  // Alias for backward compatibility on frontend logic (now handled server-side securely)
  getByBarbeiro: async function(barbeiroId) {
    return await this.getAll();
  },
  
  // Alias for backward compatibility
  getByCliente: async function(clienteId) {
    return await this.getAll();
  },
  
  // Adicionar novo agendamento
  add: async function(agendamento) {
    if (!agendamento) return false;
    
    try {
      const token = localStorage.getItem('barberpro_token');
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agendamento)
      });
      return response.ok;
    } catch (e) {
      console.error('Erro ao salvar agendamento na API:', e);
      return false;
    }
  },
  
  // Atualizar status do agendamento existente
  update: async function(id, dadosAtualizados) {
    try {
      const token = localStorage.getItem('barberpro_token');
      // No novo backend, focamos em atualizar status
      const response = await fetch(`/api/agendamentos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosAtualizados)
      });
      return response.ok;
    } catch (e) {
      console.error('Erro ao atualizar agendamento na API:', e);
      return false;
    }
  },
  
  // Apenas simula a interface antiga, na vida real seria uma API pra DELETE
  remove: async function(id) {
      return await this.update(id, { status: 'cancelado' });
  },
  
  clear: function() {
     console.warn('Clear não suportado via API publicamente.');
     return false;
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
