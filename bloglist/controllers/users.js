const userRouter = require('express').Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1 });
  response.json(users);
});

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;
  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: 'Password is less then 3 character' });
  }
  const saltRound = 10;
  const passwordHash = await bcrypt.hash(password, saltRound);

  const user = new User({
    username,
    name,
    passwordHash,
  });
  const savedUser = await user.save();
  return response.status(200).json(savedUser);
});

module.exports = userRouter;
