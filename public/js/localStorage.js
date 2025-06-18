// Salvar usuário
function salvarUsuario(cliente) {
  localStorage.setItem('barberpro_user', JSON.stringify(usuarios));
}
function cadastrarUsuario(cliente) {
  localStorage.setItem('barberpro_user', JSON.stringify(usuario));
}
function obterUsuario(cliente) {
  return JSON.parse(localStorage.getItem('barberpro_user'));
}

// Remover usuário
function removerUsuario(cliente) {
  localStorage.removeItem('barberpro_user');
}
function obterBarbeiros(cliente) {
  return JSON.parse(localStorage.getItem('barberpro_barber')) || [];
}

function removerBarbeiros(barbeiro) {
  localStorage.removeItem('barberpro_barber');
}
// Adicionar barbeiro
function adicionarBarbeiro(barbeiro) {
  let barbeiros = JSON.parse(localStorage.getItem('barberpro_barber')) || [];
  barbeiros.push(barbeiro);
  localStorage.setItem('barberpro_barber', JSON.stringify(barbeiros));
}