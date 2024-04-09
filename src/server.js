const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const app = express();
const MongoURL = process.env.MongoURL;
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("connected", () => {
  console.log("Connected to MongoDB");
});

const User = require('./models/User');
const Password = require('./models/Password');


const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.user = decoded.user;
    next();
  });
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ user: user._id }, JWT_SECRET);
  res.json({ token });
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  await newUser.save();
  const user = await User.findOne({ username });
  const token = jwt.sign({ user: user._id }, JWT_SECRET);
  res.json({ token });
});

app.get('/logout', verifyToken, (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.post('/generate-password', verifyToken, async (req, res) => {
  try {
    const { length, includeUpperCase, includeNumbers, includeSymbols } = req.body;

    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUpperCase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    res.json({ password });
  } catch (error) {
    console.error('Error generating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/passwords', verifyToken, async (req, res) => {
  try {
    const { website, password } = req.body;

    const existingPassword = await Password.findOne({ userId: req.user, website });
    if (existingPassword) {
      return res.status(400).json({ message: 'Website already exists' });
    }

    const userId = req.user;
    const newPassword = new Password({
      userId,
      website,
      password,
    });

    await newPassword.save();
    res.status(201).json({ message: 'Password added successfully' });
  } catch (error) {
    console.error('Error adding password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/passwords', verifyToken, async (req, res) => {
  try {
    console.log(req)
    const passwords = await Password.find({ userId: req.user });
    res.json(passwords);
  } catch (error) {
    console.error('Error fetching passwords:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/passwords/:id', verifyToken, async (req, res) => {
  const passwordId = req.params.id;
  try {
    await Password.findByIdAndDelete(passwordId);
    res.json({ message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Error deleting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/passwords/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user;
    const { newPassword } = req.body;

    const password = await Password.findOne({ _id: req.params.id, userId });

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    password.password = newPassword;
    await password.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
