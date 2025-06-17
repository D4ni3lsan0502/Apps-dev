// Salvar usuário
function salvarUsuario(usuario) {
  localStorage.setItem('barberpro_user', JSON.stringify(usuarios));
}
function cadastrarUsuario(usuario) {
  localStorage.setItem('barberpro_user', JSON.stringify(usuario));
}
function obterUsuario() {
  return JSON.parse(localStorage.getItem('barberpro_user'));
}

// Remover usuário
function removerUsuario() {
  localStorage.removeItem('barberpro_user');
}
function obterBarbeiros() {
  return JSON.parse(localStorage.getItem('barberpro_barber')) || [];
}

function removerBarbeiros() {
  localStorage.removeItem('barberpro_barber');
}
// Adicionar barbeiro
function adicionarBarbeiro(barbeiro) {
  let barbeiros = JSON.parse(localStorage.getItem('barberpro_barber')) || [];
  barbeiros.push(barbeiro);
  localStorage.setItem('barberpro_barber', JSON.stringify(barbeiros));
}