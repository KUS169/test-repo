// server.js - Simple User Management (Node + Express + Mongoose)
// NOTE: learning example — passwords stored in plain text. Use bcrypt in real apps.

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Local MongoDB URI (change if you use Atlas)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/userdb';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(()=> console.log('Connected to MongoDB successfully'))
  .catch((err)=> {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.send(`
    <h1>User Management System</h1>
    <p>
      <a href="/register">Register</a> |
      <a href="/login">Login</a> |
      <a href="/users">View All Registered Users</a>
    </p>
    <p>Note: This is a learning/demo server (plain text passwords). Use bcrypt in real apps.</p>
  `);
});

app.get('/register', (req, res) => {
  res.send(`
    <h2>Register</h2>
    <form method="POST" action="/register">
      <label>Username: <input name="username" required></label><br>
      <label>Email: <input name="email" type="email" required></label><br>
      <label>Password: <input name="password" type="password" required></label><br>
      <button type="submit">Register</button>
    </form>
    <p><a href="/">Back</a></p>
  `);
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.send('<h3>All fields required</h3><a href="/register">Back</a>');

    const user = new User({ username, email, password });
    await user.save();

    res.send(`<h3>User registered successfully</h3><p><a href="/login">Login now</a> | <a href="/users">See all users</a></p>`);
  } catch (err) {
    if (err.code === 11000) {
      return res.send('<h3>Error: username or email already exists</h3><a href="/register">Try again</a>');
    }
    console.error(err);
    res.status(500).send('<h3>Server error</h3>');
  }
});

app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <label>Username: <input name="username" required></label><br>
      <label>Password: <input name="password" type="password" required></label><br>
      <button type="submit">Login</button>
    </form>
    <p><a href="/">Back</a></p>
  `);
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.send('<h3>Login failed: user not found</h3><a href="/login">Try again</a>');
    if (user.password !== password) return res.send('<h3>Login failed: incorrect password</h3><a href="/login">Try again</a>');

    res.send(`<h3>Login successful</h3><p>Welcome, ${user.username}!</p><p><a href="/users">View all users</a></p>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h3>Server error</h3>');
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-__v').sort({ createdAt: -1 });
    let html = '<h2>Registered Users</h2><ul>';
    users.forEach(u => {
      html += `<li>${u.username} — ${u.email} — Registered: ${new Date(u.createdAt).toLocaleString()}</li>`;
    });
    html += '</ul><p><a href="/">Back</a></p>';
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h3>Server error</h3>');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
