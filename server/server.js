require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_db';
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(()=> console.log('MongoDB connected'))
.catch(err => { 
  console.error('MongoDB connection error:', err); 
  process.exit(1); 
});

// ---------------- API ROUTES -----------------

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// CREATE task
app.post('/api/tasks', async (req, res) => {
  const { text, done } = req.body;
  if (!text || text.trim()==='') return res.status(400).json({ error: 'text required' });

  const created = await Task.create({
    text: text.trim(),
    done: !!done
  });

  res.status(201).json(created);
});

// UPDATE task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = await Task.findByIdAndUpdate(
    id, updates, { new: true }
  );

  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});

// DELETE one task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.json({ success: true });
});

// CLEAR ALL
app.delete('/api/tasks', async (req, res) => {
  await Task.deleteMany({});
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));