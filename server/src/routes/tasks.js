const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const redisClient = require('../config/redis');
const { check, validationResult } = require('express-validator');

// [SECURITY FIX]: Centralized validation handler for task routes to ensure data consistency and prevent XSS/Injection.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }
  next();
};

// Helper function to clear redis cache for a user's tasks
const clearCache = async (userId) => {
    try {
        await redisClient.del(`tasks:${userId}`);
    } catch(e) {
        console.error('Redis delete error', e);
    }
}

// @route   GET api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cacheKey = `tasks:${req.user.id}`;
    
    // Try to get from cache first
    try {
        const cachedTasks = await redisClient.get(cacheKey);
        if (cachedTasks) {
            return res.json(JSON.parse(cachedTasks));
        }
    } catch(e) {
        console.error('Redis get error', e);
    }

    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // Save to cache
    try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks)); // Cache for 1 hour
    } catch(e) {
        console.error('Redis set error', e);
    }

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
// [SECURITY FIX]: Validated and escaped task inputs to prevent stored XSS and ensure data integrity.
router.post(
  '/',
  [
    auth,
    check('title', 'Title is required').not().isEmpty().trim().escape(),
    check('description').optional().trim().escape(),
    check('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
    check('status', 'Invalid status').optional().isIn(['todo', 'in-progress', 'done']),
    validate
  ],
  async (req, res) => {
    const { title, description, priority, status, dueDate } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      priority,
      status,
      dueDate,
      user: req.user.id,
    });

    const task = await newTask.save();
    await clearCache(req.user.id);
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
       return res.status(400).json({msg: err.message});
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
// [SECURITY FIX]: Applied validation and sanitization to task updates to maintain security standards across all task operations.
router.put(
  '/:id',
  [
    auth,
    check('title', 'Title cannot be empty').optional().not().isEmpty().trim().escape(),
    check('description').optional().trim().escape(),
    check('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
    check('status', 'Invalid status').optional().isIn(['todo', 'in-progress', 'done']),
    validate
  ],
  async (req, res) => {
    const { title, description, priority, status, dueDate } = req.body;

  // Build task object
  const taskFields = {};
  if (title) taskFields.title = title;
  if (description !== undefined) taskFields.description = description;
  if (priority) taskFields.priority = priority;
  if (status) taskFields.status = status;
  if (dueDate) taskFields.dueDate = dueDate;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Make sure user owns task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );

    await clearCache(req.user.id);
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Make sure user owns task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await task.deleteOne();

    await clearCache(req.user.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
