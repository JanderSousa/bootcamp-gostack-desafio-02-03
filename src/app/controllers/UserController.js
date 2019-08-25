import User from '../models/User';

class UserController {
  async storage(req, res) {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const { id, name, provider } = await User.create(req.body);
    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
