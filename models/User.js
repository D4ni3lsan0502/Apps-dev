const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  roles: [{ type: String, enum: ['cliente', 'barbeiro'], required: true }],
  cep: String,
  rua: String,
  bairro: String,
  cidade: String,
  estado: String,
  atendimento: { type: String, enum: ['barbearia', 'domicilio'] }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
