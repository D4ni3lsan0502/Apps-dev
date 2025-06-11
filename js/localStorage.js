// Salvar usuário
function salvarUsuario(usuario) {
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

// Obter usuário
function obterUsuario() {
  return JSON.parse(localStorage.getItem('usuario'));
}

// Remover usuário
function removerUsuario() {
  localStorage.removeItem('usuario');
}