const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
  clienteId: { type: String, required: true },
  barbeiroId: { type: String, required: true },
  data: { type: String, required: true }, // formato YYYY-MM-DD
  horario: { type: String, required: true }, // formato HH:mm
  servicos: [{
    id: String,
    nome: String,
    preco: Number,
    duracao: Number
  }],
  valorTotal: { type: Number, required: true },
  duracaoTotal: { type: Number },
  local: { type: String, enum: ['Barbearia', 'Domicilio', 'barbearia', 'domicilio'] },
  formaPagamento: { type: String },
  momentoPagamento: { type: String },
  observacoes: { type: String },
  status: { type: String, enum: ['pendente', 'confirmado', 'concluido', 'cancelado'], default: 'pendente' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);
