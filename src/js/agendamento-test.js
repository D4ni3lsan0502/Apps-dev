// Script para testar as funcionalidades de agendamento e quantidade por item

// Função para executar testes
function runTests() {
  console.log('Iniciando testes de agendamento e quantidade por item...');
  
  // Verificar se os módulos estão disponíveis
  if (!window.BarberPro || !window.BarberPro.AgendamentoStorage || !window.BarberPro.ItemQuantidadeManager) {
    console.error('Módulos necessários não encontrados!');
    return false;
  }
  
  // Limpar dados de teste anteriores
  window.BarberPro.AgendamentoStorage.clear();
  
  // Teste 1: Criar um agendamento básico
  console.log('Teste 1: Criando agendamento básico...');
  const agendamento1 = {
    id: 'test_' + Date.now(),
    clienteId: 'cliente_test',
    clienteNome: 'Cliente Teste',
    barbeiroId: 'barbeiro_test',
    data: new Date().toISOString(),
    hora: '14:00',
    status: 'pendente',
    itens: []
  };
  
  const resultado1 = window.BarberPro.AgendamentoStorage.add(agendamento1);
  console.log('Agendamento criado:', resultado1);
  
  // Teste 2: Adicionar itens com quantidade
  console.log('Teste 2: Adicionando itens com quantidade...');
  const item1 = {
    id: 'serv_001',
    nome: 'Corte de Cabelo',
    preco: 35.00,
    duracao: 30
  };
  
  const item2 = {
    id: 'serv_002',
    nome: 'Barba',
    preco: 25.00,
    duracao: 20
  };
  
  const resultado2a = window.BarberPro.ItemQuantidadeManager.adicionarItem(agendamento1.id, item1, 2);
  console.log('Item 1 adicionado:', resultado2a);
  
  const resultado2b = window.BarberPro.ItemQuantidadeManager.adicionarItem(agendamento1.id, item2, 1);
  console.log('Item 2 adicionado:', resultado2b);
  
  // Teste 3: Verificar se os itens foram salvos corretamente
  console.log('Teste 3: Verificando persistência dos itens...');
  const agendamentosSalvos = window.BarberPro.AgendamentoStorage.getAll();
  console.log('Agendamentos salvos:', agendamentosSalvos);
  
  if (agendamentosSalvos.length === 0) {
    console.error('Falha: Nenhum agendamento encontrado!');
    return false;
  }
  
  const agendamentoRecuperado = agendamentosSalvos.find(a => a.id === agendamento1.id);
  
  if (!agendamentoRecuperado) {
    console.error('Falha: Agendamento específico não encontrado!');
    return false;
  }
  
  if (!agendamentoRecuperado.itens || agendamentoRecuperado.itens.length !== 2) {
    console.error('Falha: Itens não foram salvos corretamente!');
    console.log('Itens encontrados:', agendamentoRecuperado.itens);
    return false;
  }
  
  // Verificar quantidades
  const itemCorte = agendamentoRecuperado.itens.find(i => i.id === 'serv_001');
  const itemBarba = agendamentoRecuperado.itens.find(i => i.id === 'serv_002');
  
  if (!itemCorte || itemCorte.quantidade !== 2) {
    console.error('Falha: Quantidade do item 1 incorreta!');
    return false;
  }
  
  if (!itemBarba || itemBarba.quantidade !== 1) {
    console.error('Falha: Quantidade do item 2 incorreta!');
    return false;
  }
  
  // Teste 4: Atualizar quantidade
  console.log('Teste 4: Atualizando quantidade...');
  const resultado4 = window.BarberPro.ItemQuantidadeManager.atualizarQuantidade(agendamento1.id, 'serv_001', 3);
  console.log('Quantidade atualizada:', resultado4);
  
  // Verificar atualização
  const agendamentosAtualizados = window.BarberPro.AgendamentoStorage.getAll();
  const agendamentoAtualizado = agendamentosAtualizados.find(a => a.id === agendamento1.id);
  const itemCorteAtualizado = agendamentoAtualizado.itens.find(i => i.id === 'serv_001');
  
  if (!itemCorteAtualizado || itemCorteAtualizado.quantidade !== 3) {
    console.error('Falha: Atualização de quantidade não funcionou!');
    return false;
  }
  
  // Teste 5: Remover item
  console.log('Teste 5: Removendo item...');
  const resultado5 = window.BarberPro.ItemQuantidadeManager.removerItem(agendamento1.id, 'serv_002');
  console.log('Item removido:', resultado5);
  
  // Verificar remoção
  const agendamentosAposRemocao = window.BarberPro.AgendamentoStorage.getAll();
  const agendamentoAposRemocao = agendamentosAposRemocao.find(a => a.id === agendamento1.id);
  
  if (!agendamentoAposRemocao.itens || agendamentoAposRemocao.itens.length !== 1) {
    console.error('Falha: Remoção de item não funcionou!');
    return false;
  }
  
  // Teste 6: Verificar cálculo de valor total
  console.log('Teste 6: Verificando cálculo de valor total...');
  // 3 cortes a R$35 = R$105
  if (agendamentoAposRemocao.valorTotal !== 105) {
    console.error('Falha: Cálculo de valor total incorreto!');
    console.log('Valor encontrado:', agendamentoAposRemocao.valorTotal);
    return false;
  }
  
  // Teste 7: Verificar cálculo de duração
  console.log('Teste 7: Verificando cálculo de duração...');
  // 3 cortes de 30min = 90min
  if (agendamentoAposRemocao.duracaoTotal !== 90) {
    console.error('Falha: Cálculo de duração incorreto!');
    console.log('Duração encontrada:', agendamentoAposRemocao.duracaoTotal);
    return false;
  }
  
  console.log('Todos os testes concluídos com sucesso!');
  return true;
}

// Executar testes quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Criar área de resultados de teste
  const testResults = document.createElement('div');
  testResults.id = 'test-results';
  testResults.className = 'p-4 bg-gray-100 rounded-md mt-4';
  testResults.innerHTML = '<h3 class="font-semibold text-lg mb-2">Resultados dos Testes</h3><div id="test-output" class="font-mono text-sm"></div>';
  
  document.body.appendChild(testResults);
  
  // Sobrescrever console.log para exibir na página
  const originalLog = console.log;
  const originalError = console.error;
  const testOutput = document.getElementById('test-output');
  
  console.log = function() {
    const args = Array.from(arguments);
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    
    const logElement = document.createElement('div');
    logElement.className = 'mb-1 text-green-800';
    logElement.textContent = '✓ ' + message;
    testOutput.appendChild(logElement);
    
    originalLog.apply(console, arguments);
  };
  
  console.error = function() {
    const args = Array.from(arguments);
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    
    const logElement = document.createElement('div');
    logElement.className = 'mb-1 text-red-800 font-bold';
    logElement.textContent = '✗ ' + message;
    testOutput.appendChild(logElement);
    
    originalError.apply(console, arguments);
  };
  
  // Executar testes após um pequeno delay para garantir que tudo foi carregado
  setTimeout(function() {
    const success = runTests();
    
    const resultElement = document.createElement('div');
    resultElement.className = 'mt-4 p-3 rounded-md ' + (success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
    resultElement.innerHTML = success 
      ? '<strong>✅ Todos os testes passaram!</strong> O sistema de agendamentos e quantidade por item está funcionando corretamente.'
      : '<strong>❌ Falha nos testes!</strong> Verifique os erros acima para corrigir o sistema.';
    
    testOutput.appendChild(resultElement);
  }, 500);
});
