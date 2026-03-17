require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Task = require('./models/Task');
const Workspace = require('./models/Workspace');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

app.post('/api/register', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({ email: req.body.email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});