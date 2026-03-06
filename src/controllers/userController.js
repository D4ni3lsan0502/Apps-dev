const User = require('../../models/User');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-senha');
  res.json(user);
};

exports.getUsers = async (req, res) => {
  try {
    const usuarios = await User.find().select('-senha');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};
