const express = require('express');
const path = require('path');

const { readTasks, createTask } = require('./utils/GohYuXuanUtil');
const { updateTask } = require('./utils/KwekWeiJianUtil');
const { deleteTask } = require('./utils/JamesLeowUtil');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Read Tasks
app.get('/api/tasks', readTasks);

// Create Task
app.post('/api/tasks', createTask);

// Update Task
app.put('/api/tasks/:id', updateTask);

// Delete Task
app.delete('/api/tasks/:id', deleteTask);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 5050;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});