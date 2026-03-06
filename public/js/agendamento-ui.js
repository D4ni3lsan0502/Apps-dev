// Integração do sistema de agendamentos com interface do usuário
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de agendamento
  const isAgendamentoPage = window.location.pathname.includes('agendamento.html');
  const isConfirmacaoPage = window.location.pathname.includes('confirmacao-agendamento.html');
  const isDashboardBarbeiro = window.location.pathname.includes('barbeiro-dashboard');
  const isDashboardCliente = window.location.pathname.includes('cliente-dashboard');
  
  // Inicializar componentes de agendamento
  if (isAgendamentoPage) {
    initAgendamentoPage();
  } else if (isConfirmacaoPage) {
    initConfirmacaoPage();
  } else if (isDashboardBarbeiro) {
    initDashboardBarbeiro();
  } else if (isDashboardCliente) {
    initDashboardCliente();
  }
  
  // Inicializar página de agendamento
  function initAgendamentoPage() {
    const servicosContainer = document.getElementById('servicos-container');
    const resumoContainer = document.getElementById('resumo-agendamento');
    const btnAvancar = document.getElementById('btn-avancar');
    
    if (!servicosContainer || !resumoContainer) return;
    
    // Carregar serviços disponíveis
    const servicos = getServicosDisponiveis();
    
    // Criar agendamento temporário
    const agendamentoTemp = {
      id: 'temp_' + Date.now(),
      itens: [],
      valorTotal: 0,
      duracaoTotal: 0
    };
    
    // Renderizar serviços
    renderizarServicos(servicos, servicosContainer, agendamentoTemp);
    
    // Atualizar resumo quando itens forem alterados
    atualizarResumo(agendamentoTemp, resumoContainer);
    
    // Configurar botão avançar
    if (btnAvancar) {
      btnAvancar.addEventListener('click', function() {
        // Salvar agendamento temporário na sessão
        sessionStorage.setItem('agendamento_temp', JSON.stringify(agendamentoTemp));
        
        // Avançar para próxima etapa
        window.location.href = 'confirmacao-agendamento.html';
      });
      
      // Desabilitar botão se não houver itens
      btnAvancar.disabled = agendamentoTemp.itens.length === 0;
    }
  }
  
  // Inicializar página de confirmação
  function initConfirmacaoPage() {
    const resumoContainer = document.getElementById('resumo-final');
    const formPagamento = document.getElementById('form-pagamento');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const uploadComprovante = document.getElementById('upload-comprovante');
    
    if (!resumoContainer || !formPagamento) return;
    
    // Recuperar agendamento temporário
    const agendamentoTemp = JSON.parse(sessionStorage.getItem('agendamento_temp') || '{"itens":[],"valorTotal":0,"duracaoTotal":0}');
    
    // Renderizar resumo final
    renderizarResumoFinal(agendamentoTemp, resumoContainer);
    
    // Configurar formulário de pagamento
    if (formPagamento) {
      const metodoPagamento = formPagamento.querySelector('select[name="metodo-pagamento"]');
      const momentoPagamento = formPagamento.querySelector('select[name="momento-pagamento"]');
      
      if (metodoPagamento && momentoPagamento) {
        // Mostrar/ocultar upload de comprovante com base no método e momento
        function atualizarFormPagamento() {
          const metodo = metodoPagamento.value;
          const momento = momentoPagamento.value;
          
          if (uploadComprovante) {
            if ((metodo === 'pix' || metodo === 'transferencia') && momento !== 'local') {
              uploadComprovante.classList.remove('hidden');
              btnConfirmar.disabled = true;
              btnConfirmar.setAttribute('data-requires-comprovante', 'true');
            } else {
              uploadComprovante.classList.add('hidden');
              btnConfirmar.disabled = false;
              btnConfirmar.removeAttribute('data-requires-comprovante');
            }
          }
        }
        
        metodoPagamento.addEventListener('change', atualizarFormPagamento);
        momentoPagamento.addEventListener('change', atualizarFormPagamento);
        
        // Inicializar estado
        atualizarFormPagamento();
      }
    }
    
    // Configurar upload de comprovante
    if (uploadComprovante) {
      const inputFile = uploadComprovante.querySelector('input[type="file"]');
      const previewComprovante = document.getElementById('preview-comprovante');
      
      if (inputFile && previewComprovante) {
        inputFile.addEventListener('change', function(e) {
          if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
              // Mostrar preview
              previewComprovante.innerHTML = `
                <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <p class="text-green-700">Comprovante enviado com sucesso!</p>
                  </div>
                  <div class="mt-2">
                    <img src="${e.target.result}" alt="Comprovante" class="max-h-40 rounded-md">
                  </div>
                </div>
              `;
              
              // Habilitar botão de confirmar
              if (btnConfirmar && btnConfirmar.hasAttribute('data-requires-comprovante')) {
                btnConfirmar.disabled = false;
              }
              
              // Salvar comprovante no agendamento temporário
              agendamentoTemp.comprovante = e.target.result;
              sessionStorage.setItem('agendamento_temp', JSON.stringify(agendamentoTemp));
            };
            
            reader.readAsDataURL(e.target.files[0]);
          }
        });
      }
    }
    
    // Configurar botão confirmar
    if (btnConfirmar) {
      btnConfirmar.addEventListener('click', function() {
        // Coletar dados do formulário
        const formData = new FormData(formPagamento);
        
        // Completar dados do agendamento
        agendamentoTemp.metodoPagamento = formData.get('metodo-pagamento');
        agendamentoTemp.momentoPagamento = formData.get('momento-pagamento');
        agendamentoTemp.status = 'confirmado';
        agendamentoTemp.dataConfirmacao = new Date().toISOString();
        
        // Obter dados do usuário logado
        const userData = JSON.parse(localStorage.getItem('barberpro_user') || '{}');
        agendamentoTemp.clienteId = userData.id || 'cliente_temp';
        agendamentoTemp.clienteNome = userData.nome || 'Cliente Temporário';
        
        // Salvar agendamento permanentemente
        if (window.BarberPro && window.BarberPro.AgendamentoStorage) {
          const salvo = window.BarberPro.AgendamentoStorage.add(agendamentoTemp);
          
          if (salvo) {
            // Limpar agendamento temporário
            sessionStorage.removeItem('agendamento_temp');
            
            // Mostrar mensagem de sucesso
            alert('Agendamento confirmado com sucesso!');
            
            // Redirecionar para dashboard
            window.location.href = 'cliente-dashboard.html';
          } else {
            alert('Erro ao salvar agendamento. Tente novamente.');
          }
        } else {
          console.error('Sistema de armazenamento não encontrado');
          alert('Erro no sistema. Tente novamente mais tarde.');
        }
      });
    }
  }
  
  // Inicializar dashboard do barbeiro
  function initDashboardBarbeiro() {
    const tabelaAgendamentos = document.getElementById('tabela-agendamentos');
    
    if (!tabelaAgendamentos) return;
    
    // Obter dados do barbeiro logado
    const userData = JSON.parse(localStorage.getItem('barberpro_user') || '{}');
    const barbeiroId = userData.id || 'barbeiro_temp';
    
    // Carregar agendamentos do barbeiro
    if (window.BarberPro && window.BarberPro.AgendamentoStorage) {
      const agendamentos = window.BarberPro.AgendamentoStorage.getByBarbeiro(barbeiroId);
      
      // Renderizar agendamentos
      renderizarTabelaAgendamentos(agendamentos, tabelaAgendamentos);
    }
  }
  
  // Inicializar dashboard do cliente
  function initDashboardCliente() {
    const listaAgendamentos = document.getElementById('lista-agendamentos');
    
    if (!listaAgendamentos) return;
    
    // Obter dados do cliente logado
    const userData = JSON.parse(localStorage.getItem('barberpro_user') || '{}');
    const clienteId = userData.id || 'cliente_temp';
    
    // Carregar agendamentos do cliente
    if (window.BarberPro && window.BarberPro.AgendamentoStorage) {
      const agendamentos = window.BarberPro.AgendamentoStorage.getByCliente(clienteId);
      
      // Renderizar agendamentos
      renderizarListaAgendamentos(agendamentos, listaAgendamentos);
    }
  }
  
  // Função para renderizar serviços disponíveis
  function renderizarServicos(servicos, container, agendamentoTemp) {
    if (!container) return;
    
    container.innerHTML = '';
    
    servicos.forEach(servico => {
      const servicoCard = document.createElement('div');
      servicoCard.className = 'service-card bg-white rounded-lg shadow-md p-4 mb-4 transition-all';
      
      // Verificar se o serviço já está no agendamento
      const itemExistente = agendamentoTemp.itens.find(item => item.id === servico.id);
      const quantidade = itemExistente ? itemExistente.quantidade : 0;
      
      servicoCard.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">${servico.nome}</h3>
            <p class="text-gray-600 mt-1">${servico.descricao}</p>
            <div class="flex items-center mt-2">
              <span class="text-blue-600 font-semibold">R$ ${servico.preco.toFixed(2)}</span>
              <span class="mx-2 text-gray-400">|</span>
              <span class="text-gray-600">${servico.duracao} min</span>
            </div>
          </div>
          <div class="flex items-center">
            <button class="btn-quantidade ${quantidade === 0 ? 'opacity-50' : ''}" data-action="diminuir" data-id="${servico.id}" ${quantidade === 0 ? 'disabled' : ''}>
              <i class="fas fa-minus text-blue-600"></i>
            </button>
            <span class="quantidade-display mx-3 text-lg font-semibold w-6 text-center">${quantidade}</span>
            <button class="btn-quantidade" data-action="aumentar" data-id="${servico.id}">
              <i class="fas fa-plus text-blue-600"></i>
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(servicoCard);
      
      // Configurar botões de quantidade
      const btnDiminuir = servicoCard.querySelector('[data-action="diminuir"]');
      const btnAumentar = servicoCard.querySelector('[data-action="aumentar"]');
      const quantidadeDisplay = servicoCard.querySelector('.quantidade-display');
      
      btnDiminuir.addEventListener('click', function() {
        if (quantidade > 0) {
          atualizarQuantidadeServico(servico, agendamentoTemp, quantidade - 1);
          quantidadeDisplay.textContent = quantidade - 1;
          
          if (quantidade - 1 === 0) {
            btnDiminuir.disabled = true;
            btnDiminuir.classList.add('opacity-50');
          }
          
          // Atualizar resumo
          atualizarResumo(agendamentoTemp, document.getElementById('resumo-agendamento'));
          
          // Atualizar estado do botão avançar
          const btnAvancar = document.getElementById('btn-avancar');
          if (btnAvancar) {
            btnAvancar.disabled = agendamentoTemp.itens.length === 0;
          }
        }
      });
      
      btnAumentar.addEventListener('click', function() {
        atualizarQuantidadeServico(servico, agendamentoTemp, quantidade + 1);
        quantidadeDisplay.textContent = quantidade + 1;
        
        if (quantidade === 0) {
          btnDiminuir.disabled = false;
          btnDiminuir.classList.remove('opacity-50');
        }
        
        // Atualizar resumo
        atualizarResumo(agendamentoTemp, document.getElementById('resumo-agendamento'));
        
        // Atualizar estado do botão avançar
        const btnAvancar = document.getElementById('btn-avancar');
        if (btnAvancar) {
          btnAvancar.disabled = false;
        }
      });
    });
  }
  
  // Função para atualizar quantidade de serviço no agendamento
  function atualizarQuantidadeServico(servico, agendamento, novaQuantidade) {
    if (!window.BarberPro || !window.BarberPro.ItemQuantidadeManager) {
      console.error('Sistema de gerenciamento de itens não encontrado');
      return;
    }
    
    const itemIndex = agendamento.itens.findIndex(item => item.id === servico.id);
    
    if (novaQuantidade === 0 && itemIndex !== -1) {
      // Remover item
      agendamento.itens.splice(itemIndex, 1);
    } else if (itemIndex === -1 && novaQuantidade > 0) {
      // Adicionar novo item
      agendamento.itens.push({
        ...servico,
        quantidade: novaQuantidade
      });
    } else if (itemIndex !== -1) {
      // Atualizar quantidade
      agendamento.itens[itemIndex].quantidade = novaQuantidade;
    }
    
    // Recalcular totais
    recalcularTotais(agendamento);
  }
  
  // Função para recalcular totais do agendamento
  function recalcularTotais(agendamento) {
    // Calcular valor total
    agendamento.valorTotal = agendamento.itens.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
    
    // Calcular duração total
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
  
  // Função para atualizar resumo do agendamento
  function atualizarResumo(agendamento, container) {
    if (!container) return;
    
    if (agendamento.itens.length === 0) {
      container.innerHTML = `
        <div class="p-4 bg-gray-50 rounded-md text-center">
          <p class="text-gray-500">Nenhum serviço selecionado</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="p-4 bg-blue-50 rounded-md">
        <h3 class="font-semibold text-blue-800 mb-3">Resumo do Agendamento</h3>
        <ul class="space-y-2">
    `;
    
    agendamento.itens.forEach(item => {
      html += `
        <li class="flex justify-between">
          <span>${item.nome} <span class="text-blue-600 font-medium">x${item.quantidade}</span></span>
          <span class="font-medium">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        </li>
      `;
    });
    
    html += `
        </ul>
        <div class="border-t border-blue-200 mt-3 pt-3 flex justify-between font-semibold">
          <span>Total:</span>
          <span>R$ ${agendamento.valorTotal.toFixed(2)}</span>
        </div>
        <div class="mt-2 text-blue-700 text-sm">
          <i class="far fa-clock mr-1"></i> Duração estimada: ${agendamento.duracaoTotal} minutos
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  // Função para renderizar resumo final
  function renderizarResumoFinal(agendamento, container) {
    if (!container) return;
    
    if (agendamento.itens.length === 0) {
      container.innerHTML = `
        <div class="p-4 bg-gray-50 rounded-md text-center">
          <p class="text-gray-500">Nenhum serviço selecionado</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="p-4 bg-white rounded-md shadow-md">
        <h3 class="font-semibold text-gray-800 mb-3">Detalhes do Agendamento</h3>
        <ul class="space-y-2">
    `;
    
    agendamento.itens.forEach(item => {
      html += `
        <li class="flex justify-between">
          <span>${item.nome} <span class="text-blue-600 font-medium">x${item.quantidade}</span></span>
          <span class="font-medium">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        </li>
      `;
    });
    
    html += `
        </ul>
        <div class="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold">
          <span>Total:</span>
          <span>R$ ${agendamento.valorTotal.toFixed(2)}</span>
        </div>
        <div class="mt-2 text-gray-600 text-sm">
          <i class="far fa-clock mr-1"></i> Duração estimada: ${agendamento.duracaoTotal} minutos
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  // Função para renderizar tabela de agendamentos (barbeiro)
  function renderizarTabelaAgendamentos(agendamentos, container) {
    if (!container) return;
    
    if (agendamentos.length === 0) {
      container.innerHTML = `
        <div class="p-4 bg-gray-50 rounded-md text-center">
          <p class="text-gray-500">Nenhum agendamento encontrado</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <table class="min-w-full bg-white rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-4 text-left">Cliente</th>
            <th class="py-3 px-4 text-left">Serviços</th>
            <th class="py-3 px-4 text-left">Data/Hora</th>
            <th class="py-3 px-4 text-left">Valor</th>
            <th class="py-3 px-4 text-left">Status</th>
            <th class="py-3 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    agendamentos.forEach(agendamento => {
      // Formatar lista de serviços
      let servicosHtml = '';
      if (agendamento.itens && agendamento.itens.length > 0) {
        servicosHtml = agendamento.itens.map(item => 
          `${item.nome} <span class="text-blue-600 font-medium">x${item.quantidade}</span>`
        ).join('<br>');
      } else {
        servicosHtml = 'Não especificado';
      }
      
      html += `
        <tr class="border-t border-gray-200">
          <td class="py-3 px-4">${agendamento.clienteNome || 'Cliente'}</td>
          <td class="py-3 px-4">${servicosHtml}</td>
          <td class="py-3 px-4">${formatarData(agendamento.data)} ${agendamento.hora || ''}</td>
          <td class="py-3 px-4">R$ ${agendamento.valorTotal ? agendamento.valorTotal.toFixed(2) : '0.00'}</td>
          <td class="py-3 px-4">
            <span class="status-badge ${getStatusClass(agendamento.status)}">
              ${formatarStatus(agendamento.status)}
            </span>
          </td>
          <td class="py-3 px-4">
            <button class="text-blue-600 hover:text-blue-800 mr-2" data-action="ver" data-id="${agendamento.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="text-green-600 hover:text-green-800" data-action="confirmar" data-id="${agendamento.id}">
              <i class="fas fa-check"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
    // Configurar botões de ação
    const btnVer = container.querySelectorAll('[data-action="ver"]');
    const btnConfirmar = container.querySelectorAll('[data-action="confirmar"]');
    
    btnVer.forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        // Implementar visualização detalhada
        alert('Visualizar agendamento ' + id);
      });
    });
    
    btnConfirmar.forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        // Implementar confirmação
        if (window.BarberPro && window.BarberPro.AgendamentoStorage) {
          const atualizado = window.BarberPro.AgendamentoStorage.update(id, { status: 'confirmado' });
          if (atualizado) {
            alert('Agendamento confirmado com sucesso!');
            // Recarregar página
            window.location.reload();
          }
        }
      });
    });
  }
  
  // Função para renderizar lista de agendamentos (cliente)
  function renderizarListaAgendamentos(agendamentos, container) {
    if (!container) return;
    
    if (agendamentos.length === 0) {
      container.innerHTML = `
        <div class="p-4 bg-gray-50 rounded-md text-center">
          <p class="text-gray-500">Nenhum agendamento encontrado</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    agendamentos.forEach(agendamento => {
      // Formatar lista de serviços
      let servicosHtml = '';
      if (agendamento.itens && agendamento.itens.length > 0) {
        servicosHtml = agendamento.itens.map(item => 
          `<li>${item.nome} <span class="text-blue-600 font-medium">x${item.quantidade}</span></li>`
        ).join('');
      } else {
        servicosHtml = '<li>Serviço não especificado</li>';
      }
      
      html += `
        <div class="bg-white rounded-lg shadow-md p-4 mb-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">Agendamento #${agendamento.id.substring(0, 8)}</h3>
              <p class="text-gray-600 mt-1">${formatarData(agendamento.data)} às ${agendamento.hora || 'horário não definido'}</p>
            </div>
            <span class="status-badge ${getStatusClass(agendamento.status)}">
              ${formatarStatus(agendamento.status)}
            </span>
          </div>
          
          <div class="mt-3">
            <h4 class="font-medium text-gray-700">Serviços:</h4>
            <ul class="mt-1 space-y-1 text-gray-600">
              ${servicosHtml}
            </ul>
          </div>
          
          <div class="mt-3 flex justify-between items-center">
            <div>
              <span class="font-medium">Total:</span>
              <span class="text-blue-600 font-semibold">R$ ${agendamento.valorTotal ? agendamento.valorTotal.toFixed(2) : '0.00'}</span>
            </div>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300" data-action="detalhes" data-id="${agendamento.id}">
              Ver Detalhes
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Configurar botões de detalhes
    const btnDetalhes = container.querySelectorAll('[data-action="detalhes"]');
    
    btnDetalhes.forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        // Implementar visualização detalhada
        alert('Visualizar detalhes do agendamento ' + id);
      });
    });
  }
  
  // Função para obter serviços disponíveis (simulação)
  function getServicosDisponiveis() {
    return [
      {
        id: 'serv_001',
        nome: 'Corte de Cabelo',
        descricao: 'Corte masculino tradicional',
        preco: 35.00,
        duracao: 30
      },
      {
        id: 'serv_002',
        nome: 'Barba',
        descricao: 'Aparar e modelar barba',
        preco: 25.00,
        duracao: 20
      },
      {
        id: 'serv_003',
        nome: 'Corte + Barba',
        descricao: 'Combo corte e barba',
        preco: 55.00,
        duracao: 45
      },
      {
        id: 'serv_004',
        nome: 'Hidratação',
        descricao: 'Tratamento para cabelos',
        preco: 40.00,
        duracao: 30
      },
      {
        id: 'serv_005',
        nome: 'Coloração',
        descricao: 'Pintura de cabelo',
        preco: 70.00,
        duracao: 60
      }
    ];
  }
  
  // Funções auxiliares
  function formatarData(dataString) {
    if (!dataString) return 'Data não definida';
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch (e) {
      return dataString;
    }
  }
  
  function formatarStatus(status) {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'confirmado': return 'Confirmado';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return 'Pendente';
    }
  }
  
  function getStatusClass(status) {
    switch (status) {
      case 'pendente': return 'pending';
      case 'confirmado': return 'paid';
      case 'concluido': return 'paid';
      case 'cancelado': return 'canceled';
      default: return 'pending';
    }
  }
});
