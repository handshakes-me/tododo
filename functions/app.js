const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

// Set up view engine and specify the views folder (located one level up)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static assets from the public folder (located one level up)
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory "database" for todos with auto-incrementing ID.
let todos = [];
let currentId = 1;

/**
 * GET /
 * Renders the index page with all todos. Supports filtering by priority.
 */
app.get('/', (req, res) => {
  const selectedPriority = req.query.priority || '';
  const filteredTodos = selectedPriority
    ? todos.filter(todo => todo.priority === selectedPriority)
    : todos;
  res.render('index', { todos: filteredTodos, selectedPriority });
});

/**
 * POST /add
 * Adds a new todo if the content is not empty.
 */
app.post('/add', (req, res) => {
  const { content, priority } = req.body;
  if (content && content.trim() !== '') {
    todos.push({
      id: currentId++,
      content: content.trim(),
      priority: priority || 'Low'
    });
  }
  res.redirect('/');
});

/**
 * GET /edit/:id
 * Renders the edit page for the specified todo.
 */
app.get('/edit/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.redirect('/');
  }
  res.render('edit', { todo });
});

/**
 * POST /edit/:id
 * Updates the todo if the new content is not empty.
 */
app.post('/edit/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { content, priority } = req.body;
  const todo = todos.find(t => t.id === id);
  if (todo && content.trim() !== '') {
    todo.content = content.trim();
    todo.priority = priority;
  }
  res.redirect('/');
});

/**
 * GET /delete/:id
 * Deletes the specified todo.
 */
app.get('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  todos = todos.filter(t => t.id !== id);
  res.redirect('/');
});

// Export the Express app as a serverless function handler
module.exports.handler = serverless(app);
