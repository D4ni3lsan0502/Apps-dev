// models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cep: String,
  rua: String,
  bairro: String,
  cidade: String,
  estado: String,
  atendimento: { type: String, enum: ['barbearia', 'domicilio'] }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
