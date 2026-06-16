const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
  createUser,
  findUserByEmail,
  findUserByUsername,
} = require('../models/userModel');

const usernameRegex = /^.{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const validateRegisterParams = ({ username, email, password }) => {
  if (!username || !usernameRegex.test(username)) {
    return 'Username must be 3-20 characters.';
  }

  if (!email || !emailRegex.test(email)) {
    return 'Email format is invalid.';
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
};

const validateLoginParams = ({ username, password }) => {
  if (!username) {
    return 'Username is required.';
  }

  if (typeof password !== 'string' || !password) {
    return 'Password is required.';
  }

  return null;
};

const signToken = (user) => jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
);

const register = async (req, res, next) => {
  try {
    const username = normalizeString(req.body.username);
    const email = normalizeString(req.body.email).toLowerCase();
    const password = req.body.password;

    const validationMessage = validateRegisterParams({ username, email, password });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const existingUsername = await findUserByUsername(username);

    if (existingUsername) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const existingEmail = await findUserByEmail(email);

    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ username, email, password: hashedPassword });

    return res.status(201).json({
      message: 'User registered successfully.',
      user,
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const username = normalizeString(req.body.username);
    const password = req.body.password;

    const validationMessage = validateLoginParams({ username, password });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = signToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
};