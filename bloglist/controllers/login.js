const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/users');

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username });
  const isPasswordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return response.status(401).json({ error: 'invalid username or password' });
  }
  const userToken = {
    username: user.username,
    id: user._id,
  };
  const token = jwt.sign(userToken, process.env.SECRET, { expiresIn: 60 * 60 });
  return response.status(200).json({
    token: token,
    username: user.username,
  });
});

module.exports = loginRouter;
