const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Workspace = require('./models/Workspace');
const auth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

app.post('/api/register', async (req, res) => {
  console.log("Register route hit with email:", req.body.email);
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/workspaces', auth, async (req, res) => {
  const workspaces = await Workspace.find({ user: req.user });
  res.json(workspaces);
});

app.post('/api/workspaces', auth, async (req, res) => {
  const workspace = new Workspace({ name: req.body.name, user: req.user });
  await workspace.save();
  res.json(workspace);
});

app.get('/api/tasks/:workspaceId', auth, async (req, res) => {
  const tasks = await Task.find({ user: req.user, workspace: req.params.workspaceId });
  res.json(tasks);
});

app.post('/api/tasks', auth, async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority || 'MEDIUM',
    user: req.user,
    workspace: req.body.workspaceId
  });
  await task.save();
  res.json(task);
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  const updates = {};
  if (req.body.title) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.status) updates.status = req.body.status;
  if (req.body.priority) updates.priority = req.body.priority;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    updates,
    { returnDocument: 'after' }
  );
  res.json(task);
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ message: 'Task deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '127.0.0.1', () => console.log(`Server running on http://127.0.0.1:${PORT}`));